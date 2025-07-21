import html2canvas from "html2canvas"
import jsPDF from "jspdf"

export const downloadPDF = async (element: HTMLElement, filename: string) => {
  try {
    const canvas = await html2canvas(element, {
      scale: 2,
      useCORS: true,
      allowTaint: true,
      backgroundColor: "#ffffff",
    })

    const imgData = canvas.toDataURL("image/png")
    const pdf = new jsPDF("p", "mm", "a4")

    const imgWidth = 210
    const pageHeight = 295
    const imgHeight = (canvas.height * imgWidth) / canvas.width
    let heightLeft = imgHeight

    let position = 0

    pdf.addImage(imgData, "PNG", 0, position, imgWidth, imgHeight)
    heightLeft -= pageHeight

    while (heightLeft >= 0) {
      position = heightLeft - imgHeight
      pdf.addPage()
      pdf.addImage(imgData, "PNG", 0, position, imgWidth, imgHeight)
      heightLeft -= pageHeight
    }

    pdf.save(filename)
  } catch (error) {
    console.error("Error generating PDF:", error)
    throw error
  }
}

export const shareToWhatsApp = async (element: HTMLElement, message: string) => {
  try {
    const canvas = await html2canvas(element, {
      scale: 2,
      useCORS: true,
      allowTaint: true,
      backgroundColor: "#ffffff",
    })

    const imgData = canvas.toDataURL("image/png")

    // Create a temporary link to download the image
    const link = document.createElement("a")
    link.download = `report-${Date.now()}.png`
    link.href = imgData

    // For mobile devices, we can use the Web Share API
    if (navigator.share) {
      // Convert canvas to blob
      canvas.toBlob(async (blob) => {
        if (blob) {
          const file = new File([blob], `report-${Date.now()}.png`, { type: "image/png" })
          await navigator.share({
            title: "Report",
            text: message,
            files: [file],
          })
        }
      })
    } else {
      // Fallback: Open WhatsApp Web with message
      const encodedMessage = encodeURIComponent(message)
      const whatsappUrl = `https://wa.me/?text=${encodedMessage}`
      window.open(whatsappUrl, "_blank")

      // Also trigger download of the image
      link.click()
    }
  } catch (error) {
    console.error("Error sharing to WhatsApp:", error)
    throw error
  }
}
