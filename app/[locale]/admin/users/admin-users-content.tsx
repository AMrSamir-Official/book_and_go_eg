"use client";

import { DashboardLayout } from "@/components/layout/dashboard-layout";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { useToast } from "@/hooks/use-toast";
import { User as UserInterface } from "@/lib/session";
import {
  CheckCircle,
  Eye,
  MoreHorizontal,
  Plus,
  Search,
  Trash2,
  UserCheck,
  Users,
  UserX,
  XCircle,
} from "lucide-react";
import { useTranslations } from "next-intl";
import { memo, useCallback, useMemo, useState, useTransition } from "react";
import {
  createUserAction,
  deleteUserAction,
  updateUserAction,
} from "./actions";

// واجهة سجلات الدخول
interface LoginLog {
  _id: string;
  timestamp: string;
  ipAddress: string;
  location: { country: string; region: string; city: string };
  userAgent: string;
  success: boolean;
}

// تعديل واجهة المستخدم لتشمل سجلات الدخول
interface User extends UserInterface {
  loginLogs?: LoginLog[];
}

export const AdminUsersContent = memo(function AdminUsersContent({
  initialUsers,
}: {
  initialUsers: User[];
}) {
  const t = useTranslations("common");
  const { toast } = useToast();
  const [users, setUsers] = useState<User[]>(initialUsers);
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedUser, setSelectedUser] = useState<User | null>(null);
  const [activeTab, setActiveTab] = useState("users");
  const [isCreateDialogOpen, setIsCreateDialogOpen] = useState(false);
  const [isPending, startTransition] = useTransition();

  const filteredUsers = useMemo(() => {
    if (!searchTerm) return users;
    return users.filter(
      (user) =>
        user.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        user.email.toLowerCase().includes(searchTerm.toLowerCase())
    );
  }, [searchTerm, users]);

  const handleDeleteUser = useCallback(
    async (userId: string) => {
      startTransition(async () => {
        const result = await deleteUserAction(userId);
        if (result.success) {
          setUsers((currentUsers) =>
            currentUsers.filter((user) => user._id !== userId)
          );
          toast({ title: "User Deleted", description: result.message });
          if (selectedUser?._id === userId) {
            setSelectedUser(null);
            setActiveTab("users");
          }
        } else {
          toast({
            title: "Error",
            description: result.message,
            variant: "destructive",
          });
        }
      });
    },
    [toast, selectedUser]
  );

  const handleToggleStatus = useCallback(
    async (user: User) => {
      if (!user || !user._id) {
        toast({
          title: "Critical Error",
          description: "User ID is missing.",
          variant: "destructive",
        });
        return;
      }
      startTransition(async () => {
        const result = await updateUserAction(user._id, {
          isActive: !user.isActive,
        });
        if (result.success && result.data) {
          setUsers((currentUsers) =>
            currentUsers.map((u) =>
              u._id === user._id ? { ...u, ...result.data } : u
            )
          );
          toast({
            title: "Status Updated",
            description: "User status has been changed.",
          });
        } else {
          toast({
            title: "Error",
            description: result.message,
            variant: "destructive",
          });
        }
      });
    },
    [toast, startTransition]
  );

  const handleViewUser = useCallback((user: User) => {
    setSelectedUser(user);
    setActiveTab("details");
  }, []);

  const handleCreateUser = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    const formData = new FormData(event.currentTarget);
    startTransition(async () => {
      const result = await createUserAction(formData);
      if (result.success) {
        toast({ title: "User Created", description: result.message });
        setIsCreateDialogOpen(false);
      } else {
        toast({
          title: "Error",
          description: result.message,
          variant: "destructive",
        });
      }
    });
  };

  const formatRelativeTime = useCallback((timestamp?: string) => {
    if (!timestamp) return "Never";
    const date = new Date(timestamp);
    const now = new Date();
    const diffInSeconds = Math.floor((now.getTime() - date.getTime()) / 1000);
    if (diffInSeconds < 60) return "Just now";
    const diffInMinutes = Math.floor(diffInSeconds / 60);
    if (diffInMinutes < 60) return `${diffInMinutes}m ago`;
    const diffInHours = Math.floor(diffInMinutes / 60);
    if (diffInHours < 24) return `${diffInHours}h ago`;
    return date.toLocaleDateString();
  }, []);

  return (
    <DashboardLayout>
      <div className="space-y-6">
        <div>
          <h1 className="text-2xl sm:text-3xl font-bold flex items-center">
            <Users className="mr-3 h-8 w-8" /> User Management
          </h1>
          <p className="text-muted-foreground">
            Manage users, view their activity, and monitor login logs
          </p>
        </div>
        <Tabs value={activeTab} onValueChange={setActiveTab}>
          <TabsList className="grid w-full grid-cols-2">
            <TabsTrigger value="users">All Users</TabsTrigger>
            <TabsTrigger value="details" disabled={!selectedUser}>
              User Details
            </TabsTrigger>
          </TabsList>
          <TabsContent value="users">
            <Card>
              <CardHeader>
                <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 flex-wrap">
                  <div>
                    <CardTitle>All Users ({users.length})</CardTitle>
                    <CardDescription>
                      Manage and monitor all system users
                    </CardDescription>
                  </div>
                  <div className="flex items-center space-x-2">
                    <div className="relative">
                      <Search className="absolute left-2 top-2.5 h-4 w-4 text-muted-foreground" />
                      <Input
                        placeholder="Search users..."
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                        className="pl-8 w-full sm:w-64"
                      />
                    </div>
                    <Dialog
                      open={isCreateDialogOpen}
                      onOpenChange={setIsCreateDialogOpen}
                    >
                      <DialogTrigger asChild>
                        <Button>
                          <Plus className="mr-2 h-4 w-4" /> Add User
                        </Button>
                      </DialogTrigger>
                      <DialogContent className="sm:max-w-md">
                        <DialogHeader>
                          <DialogTitle>Create New User</DialogTitle>
                        </DialogHeader>
                        <form
                          onSubmit={handleCreateUser}
                          className="grid gap-4 py-4"
                        >
                          <div className="grid grid-cols-4 items-center gap-4">
                            <Label htmlFor="name" className="text-right">
                              Name
                            </Label>
                            <Input
                              id="name"
                              name="name"
                              className="col-span-3"
                              placeholder="Full Name"
                              required
                            />
                          </div>
                          <div className="grid grid-cols-4 items-center gap-4">
                            <Label htmlFor="email" className="text-right">
                              Email
                            </Label>
                            <Input
                              id="email"
                              name="email"
                              type="email"
                              className="col-span-3"
                              placeholder="user@example.com"
                              required
                            />
                          </div>
                          <div className="grid grid-cols-4 items-center gap-4">
                            <Label htmlFor="password" className="text-right">
                              Password
                            </Label>
                            <Input
                              id="password"
                              name="password"
                              type="password"
                              className="col-span-3"
                              placeholder="••••••••"
                              required
                            />
                          </div>
                          <div className="grid grid-cols-4 items-center gap-4">
                            <Label htmlFor="role" className="text-right">
                              Role
                            </Label>
                            <Select name="role" defaultValue="user">
                              <SelectTrigger className="col-span-3">
                                <SelectValue placeholder="Select role" />
                              </SelectTrigger>
                              <SelectContent>
                                <SelectItem value="user">User</SelectItem>
                                <SelectItem value="admin">Admin</SelectItem>
                              </SelectContent>
                            </Select>
                          </div>
                          <div className="flex justify-end space-x-2 mt-4">
                            <Button
                              variant="outline"
                              type="button"
                              onClick={() => setIsCreateDialogOpen(false)}
                            >
                              Cancel
                            </Button>
                            <Button type="submit" disabled={isPending}>
                              {isPending ? "Creating..." : "Create User"}
                            </Button>
                          </div>
                        </form>
                      </DialogContent>
                    </Dialog>
                  </div>
                </div>
              </CardHeader>
              <CardContent>
                <div className="overflow-x-auto">
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead>User</TableHead>
                        <TableHead>Role</TableHead>
                        <TableHead>Status</TableHead>
                        <TableHead>Last Login</TableHead>
                        <TableHead>Join Date</TableHead>
                        <TableHead className="text-right">Actions</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {filteredUsers.map((user) => (
                        <TableRow key={user._id}>
                          <TableCell>
                            <div className="flex items-center space-x-3">
                              <Avatar className="h-8 w-8">
                                <AvatarImage
                                  src={user.avatar || "/placeholder.svg"}
                                  alt={user.name}
                                />
                                <AvatarFallback>
                                  {user.name.charAt(0).toUpperCase()}
                                </AvatarFallback>
                              </Avatar>
                              <div>
                                <div className="font-medium">{user.name}</div>
                                <div className="text-sm text-muted-foreground">
                                  {user.email}
                                </div>
                              </div>
                            </div>
                          </TableCell>
                          <TableCell>
                            <Badge
                              variant={
                                user.role === "admin" ? "default" : "secondary"
                              }
                            >
                              {user.role}
                            </Badge>
                          </TableCell>
                          <TableCell>
                            <Badge
                              variant={
                                user.isActive ? "default" : "destructive"
                              }
                            >
                              {user.isActive ? "Active" : "Inactive"}
                            </Badge>
                          </TableCell>
                          <TableCell>
                            {formatRelativeTime(user.lastLogin)}
                          </TableCell>
                          <TableCell>
                            {new Date(user.createdAt).toLocaleDateString()}
                          </TableCell>
                          <TableCell className="text-right">
                            <DropdownMenu>
                              <DropdownMenuTrigger asChild>
                                <Button variant="ghost" className="h-8 w-8 p-0">
                                  <MoreHorizontal className="h-4 w-4" />
                                </Button>
                              </DropdownMenuTrigger>
                              <DropdownMenuContent align="end">
                                <DropdownMenuItem
                                  onClick={() => handleViewUser(user)}
                                >
                                  <Eye className="mr-2 h-4 w-4" /> View Details
                                </DropdownMenuItem>
                                <DropdownMenuItem
                                  onClick={() => handleToggleStatus(user)}
                                >
                                  {user.isActive ? (
                                    <>
                                      <UserX className="mr-2 h-4 w-4" />{" "}
                                      Deactivate
                                    </>
                                  ) : (
                                    <>
                                      <UserCheck className="mr-2 h-4 w-4" />{" "}
                                      Activate
                                    </>
                                  )}
                                </DropdownMenuItem>
                                <DropdownMenuItem
                                  className="text-destructive"
                                  onClick={() => handleDeleteUser(user._id)}
                                >
                                  <Trash2 className="mr-2 h-4 w-4" /> Delete
                                  User
                                </DropdownMenuItem>
                              </DropdownMenuContent>
                            </DropdownMenu>
                          </TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                </div>
              </CardContent>
            </Card>
          </TabsContent>
          <TabsContent value="details">
            {selectedUser ? (
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                <Card>
                  <CardHeader>
                    <CardTitle>User Information</CardTitle>
                    <CardDescription>
                      Detailed information about {selectedUser.name}
                    </CardDescription>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <div className="flex items-center space-x-4">
                      <Avatar className="h-16 w-16">
                        <AvatarImage
                          src={selectedUser.avatar || "/placeholder.svg"}
                          alt={selectedUser.name}
                        />
                        <AvatarFallback className="text-2xl">
                          {selectedUser.name.charAt(0).toUpperCase()}
                        </AvatarFallback>
                      </Avatar>
                      <div>
                        <h3 className="text-xl font-semibold">
                          {selectedUser.name}
                        </h3>
                        <p className="text-muted-foreground">
                          {selectedUser.email}
                        </p>
                      </div>
                    </div>
                    <div className="grid grid-cols-2 gap-4">
                      <div>
                        <label className="text-sm font-medium text-muted-foreground">
                          Role
                        </label>
                        <div className="mt-1">
                          <Badge
                            variant={
                              selectedUser.role === "admin"
                                ? "default"
                                : "secondary"
                            }
                          >
                            {selectedUser.role}
                          </Badge>
                        </div>
                      </div>
                      <div>
                        <label className="text-sm font-medium text-muted-foreground">
                          Status
                        </label>
                        <div className="mt-1">
                          <Badge
                            variant={
                              selectedUser.isActive ? "default" : "destructive"
                            }
                          >
                            {selectedUser.isActive ? "Active" : "Inactive"}
                          </Badge>
                        </div>
                      </div>
                      <div>
                        <label className="text-sm font-medium text-muted-foreground">
                          Join Date
                        </label>
                        <div className="mt-1">
                          {new Date(
                            selectedUser.createdAt
                          ).toLocaleDateString()}
                        </div>
                      </div>
                      <div>
                        <label className="text-sm font-medium text-muted-foreground">
                          Last Login
                        </label>
                        <div className="mt-1">
                          {formatRelativeTime(selectedUser.lastLogin)}
                        </div>
                      </div>
                    </div>
                  </CardContent>
                </Card>
                <Card>
                  <CardHeader>
                    <CardTitle>Login Logs</CardTitle>
                    <CardDescription>
                      Recent login sessions for this user.
                    </CardDescription>
                  </CardHeader>
                  <CardContent>
                    {/* --- بداية كود عرض سجلات الدخول --- */}
                    {selectedUser.loginLogs &&
                    selectedUser.loginLogs.length > 0 ? (
                      <div className="space-y-4 max-h-64 overflow-y-auto pr-2">
                        {selectedUser.loginLogs
                          .slice()
                          .reverse()
                          .map((log) => (
                            <div
                              key={log._id}
                              className="flex items-center space-x-3 text-sm"
                            >
                              <div>
                                {log.success ? (
                                  <CheckCircle className="h-5 w-5 text-green-500" />
                                ) : (
                                  <XCircle className="h-5 w-5 text-red-500" />
                                )}
                              </div>
                              <div className="flex-1">
                                <p className="font-medium">
                                  {log.success
                                    ? "Successful Login"
                                    : "Failed Login"}
                                </p>
                                <p className="text-xs text-muted-foreground">
                                  {new Date(log.timestamp).toLocaleString()} -
                                  IP: {log.ipAddress}
                                </p>
                              </div>
                            </div>
                          ))}
                      </div>
                    ) : (
                      <p className="text-sm text-muted-foreground text-center py-4">
                        No login logs available for this user.
                      </p>
                    )}
                    {/* --- نهاية كود عرض سجلات الدخول --- */}
                  </CardContent>
                </Card>
              </div>
            ) : (
              <Card>
                <CardContent className="flex flex-col items-center justify-center py-12">
                  <Users className="h-12 w-12 text-muted-foreground mb-4" />
                  <h3 className="text-lg font-semibold mb-2">
                    No User Selected
                  </h3>
                  <p className="text-muted-foreground text-center">
                    Select a user to view their details.
                  </p>
                  <Button
                    variant="outline"
                    className="mt-4"
                    onClick={() => setActiveTab("users")}
                  >
                    Go to Users List
                  </Button>
                </CardContent>
              </Card>
            )}
          </TabsContent>
        </Tabs>
      </div>
    </DashboardLayout>
  );
});
