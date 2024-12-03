import { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import toast from "react-hot-toast";
import { Button } from "../components/ui/button";
import { Skeleton } from "../components/ui/skeleton";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from "../components/ui/card";
import { Badge } from "../components/ui/badge";
import { Input } from "../components/ui/input";
import { Pencil, Eye, EyeOff, X, Plus, UserRoundPlus } from "lucide-react";

type ProfileData = {
  username: string;
  name: string;
  profile_photo: string | null;
  connection_count: number;
  work_history?: string;
  skills?: string;
  relevant_posts?: { id: string; content: string; created_at: string }[];
  new_password?: string;
  confirm_password?: string;
  current_password?: string;
  new_skill?: string;
};

export default function Profile() {
  const navigate = useNavigate();

  const { userId } = useParams<{ userId: string }>();
  const [profile, setProfile] = useState<ProfileData | null>(null);
  const [isEditing, setIsEditing] = useState(false);
  const [formData, setFormData] = useState({
    username: "",
    name: "",
    work_history: "",
    skills: "",
    profile_photo: null as File | null,
    new_password: "",
    confirm_password: "",
    current_password: "",
    new_skill: "",
  });
  const [photoUrl, setPhotoUrl] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [isCurrentPasswordVisible, setIsCurrentPasswordVisible] =
    useState(false);
  const [isNewPasswordVisible, setIsNewPasswordVisible] = useState(false);
  const [isConfirmPasswordVisible, setIsConfirmPasswordVisible] =
    useState(false);
  const [loggedInUserId, setLoggedInUserId] = useState<string | null>(null);
  const [isConnected, setIsConnected] = useState(false);

  if (!userId) {
    toast.error("User ID is required to view the profile.");
    return <div className="text-center text-red-500">User ID is missing.</div>;
  }

  const fetchLoggedInUser = async () => {
    try {
      const response = await fetch("http://localhost:3000/api/check-session", {
        method: "GET",
        credentials: "include",
      });

      if (!response.ok) {
        throw new Error("Failed to fetch logged-in user");
      }

      const userData = await response.json();
      setLoggedInUserId(userData.user.userId);
      console.log("Logged in user ID:", userData.user.userId);
    } catch (error) {
      toast.error("Error fetching logged-in user");
    }
  };

  const fetchProfile = async () => {
    setIsLoading(true);
    try {
      const response = await fetch(
        `http://localhost:3000/api/profile/${userId}?logged_in_user_id=${loggedInUserId}`,
        {
          method: "GET",
          credentials: "include",
        },
      );

      if (!response.ok) {
        throw new Error("Failed to fetch profile");
      }

      const data = await response.json();
      setProfile(data.body || null);

      if (data.body) {
        setFormData({
          username: data.body.username || "",
          name: data.body.name || "",
          work_history: data.body.work_history || "",
          skills: data.body.skills || "",
          profile_photo: null,
          new_password: "",
          confirm_password: "",
          current_password: "",
          new_skill: "",
        });

        if (data.body.profile_photo) {
          setPhotoUrl(data.body.profile_photo);
        }

        console.log("Is connected:", data.body.is_connected);
        setIsConnected(data.body.is_connected);
      }
    } catch (error) {
      console.error(error);
      toast.error("Error fetching profile");
    } finally {
      setIsLoading(false);
    }
  };

  const updateProfile = async () => {
    if (formData.new_password && !formData.current_password) {
      toast.error("Current password is required to update password");
      return;
    }

    if (
      formData.new_password &&
      formData.new_password !== formData.confirm_password
    ) {
      toast.error("New password and confirm password do not match");
      return;
    }

    const toastId = toast.loading("Updating profile...");
    try {
      const form = new FormData();
      form.append("username", formData.username);
      form.append("name", formData.name);
      form.append("skills", formData.skills);
      const validWorkHistory = parseWorkHistory(
        formData.work_history || "",
      ).filter((job) => job.position.trim());
      form.append("work_history", formatWorkHistory(validWorkHistory));

      if (formData.profile_photo) {
        form.append("profile_photo", formData.profile_photo);
      }

      if (formData.new_password) {
        form.append("current_password", formData.current_password);
        form.append("new_password", formData.new_password);
      }

      const response = await fetch(
        `http://localhost:3000/api/profile/${userId}`,
        {
          method: "PUT",
          credentials: "include",
          body: form,
        },
      );

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || "An unknown error occurred");
      }

      toast.success("Profile updated successfully");
      setIsEditing(false);
      fetchProfile();
    } catch (error) {
      if (error instanceof Error) {
        toast.error(error.message);
      } else {
        toast.error("An unknown error occurred");
      }
    } finally {
      toast.dismiss(toastId);
    }
  };

  useEffect(() => {
    fetchLoggedInUser();
  }, []);
  
  useEffect(() => {
    if (loggedInUserId) {
      fetchProfile();
    }
  }, [loggedInUserId, userId]);

  const sortWorkHistory = (
    workHistory: {
      position: string;
      company: string;
      start_date: string;
      end_date: string;
    }[],
  ) => {
    return workHistory.sort((a, b) => {
      const dateA =
        a.end_date && a.end_date !== "Present"
          ? new Date(a.end_date)
          : new Date();
      const dateB =
        b.end_date && b.end_date !== "Present"
          ? new Date(b.end_date)
          : new Date();
      return dateB.getTime() - dateA.getTime();
    });
  };

  const parseWorkHistory = (workHistory: string) => {
    return workHistory
      .split("\n")
      .filter((entry) => entry.trim())
      .map((entry) => {
        const parts = entry.split("|").map((part) => part);
        const [position = "", company = "", start_date = "", end_date = ""] =
          parts;
        return { position, company, start_date, end_date };
      });
  };

  const parseWorkHistoryForDisplay = (workHistory: string) => {
    const parsed = parseWorkHistory(workHistory).map((job) => ({
      ...job,
      end_date: job.end_date && job.end_date.trim() ? job.end_date : "Present",
    }));
    return sortWorkHistory(parsed);
  };

  const formatWorkHistory = (
    workHistoryArray: {
      position: string;
      company: string;
      start_date: string;
      end_date: string;
    }[],
  ) => {
    return workHistoryArray
      .map(
        (job) =>
          `${job.position}|${job.company}|${job.start_date}|${job.end_date}`,
      )
      .join("\n");
  };

  const sendRequest = async (userId: string) => {
    const toastId = toast.loading("Sending connection request...");
    try {
      const response = await fetch(
        "http://localhost:3000/api/connections/request",
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          credentials: "include",
          body: JSON.stringify({ userId }),
        }
      );
  
      if (!response.ok) {
        throw new Error("Failed to send connection request");
      }
  
      toast.success("Connection request sent successfully");
    } catch (error) {
      console.error(error);
      toast.error("Error sending connection request");
    } finally {
      toast.dismiss(toastId);
    }
  };  

  return (
    <div className="flex flex-col items-center min-h-screen bg-wbd-background pt-32 p-6">
      {isLoading ? (
        <div className="w-full max-w-3xl">
          <Card className="bg-white shadow-md rounded-lg overflow-hidden">
            <div className="bg-gradient-to-r from-wbd-primary to-wbd-tertiary h-36 relative">
              <Skeleton className="absolute top-20 left-6 w-28 h-28 rounded-full border-4 border-white shadow-md" />
            </div>
            <CardContent className="p-6 pt-14">
              <Skeleton className="w-2/3 h-6 mb-4" />
              <Skeleton className="w-1/3 h-4 mb-2" />
              <Skeleton className="w-1/4 h-4" />
            </CardContent>
          </Card>

          <Card className="bg-white shadow-md rounded-lg mt-6">
            <CardHeader>
              <Skeleton className="w-1/4 h-6 mb-4" />
            </CardHeader>
            <CardContent>
              <Skeleton className="w-full h-4 mb-4" />
              <Skeleton className="w-3/4 h-4 mb-4" />
              <Skeleton className="w-2/3 h-4 mb-4" />
            </CardContent>
          </Card>

          <Card className="bg-white shadow-md rounded-lg mt-6">
            <CardHeader>
              <Skeleton className="w-1/4 h-6 mb-4" />
            </CardHeader>
            <CardContent>
              <Skeleton className="w-1/2 h-4 mb-4" />
              <Skeleton className="w-full h-4 mb-4" />
              <Skeleton className="w-3/4 h-4 mb-4" />
            </CardContent>
          </Card>
        </div>
      ) : profile ? (
        <>
          <Card className="w-full max-w-3xl bg-white shadow-md rounded-lg overflow-hidden">
            <div className="bg-gradient-to-r from-wbd-primary to-wbd-tertiary h-36 relative">
              <div className="absolute top-20 left-6 flex flex-col items-center">
                {isEditing ? (
                  <div className="relative group">
                    <Input
                      type="file"
                      accept="image/*"
                      className="hidden"
                      id="profile-photo-upload"
                      onChange={(e) => {
                        if (e.target.files && e.target.files[0]) {
                          setFormData((prev) => ({
                            ...prev,
                            profile_photo: e.target.files![0],
                          }));
                          setPhotoUrl(URL.createObjectURL(e.target.files[0]));
                        }
                      }}
                    />
                    <label
                      htmlFor="profile-photo-upload"
                      className="cursor-pointer"
                    >
                      <div className="relative">
                        <img
                          src={photoUrl || "/default-profile.png"}
                          alt="Profile"
                          className="w-28 h-28 rounded-full border-4 border-white shadow-md"
                        />
                        <div className="absolute inset-0 bg-black opacity-0 group-hover:opacity-50 rounded-full flex justify-center items-center transition-opacity duration-200">
                          <span className="text-white text-sm">Edit Photo</span>
                        </div>
                      </div>
                    </label>
                  </div>
                ) : (
                  <img
                    src={photoUrl || "/default-profile.png"}
                    alt="Profile"
                    className="w-28 h-28 rounded-full border-4 border-white"
                  />
                )}
              </div>

              {!isEditing && userId === loggedInUserId && (
                <button
                  className="absolute -bottom-12 right-4 p-2"
                  onClick={() => setIsEditing(!isEditing)}
                >
                  <Pencil className="h-6 w-6 text-wbd-primary" />
                </button>
              )}
            </div>

            <CardContent className="p-6 pt-14">
              {isEditing ? (
                <div className="pt-4">
                  <label
                    htmlFor="name"
                    className="block text-sm font-medium text-wbd-primary mb-1"
                  >
                    Name
                  </label>
                  <Input
                    className="mb-4 w-full p-2 rounded border border-gray-300 focus:outline-none focus:ring-1 focus:ring-wbd-tertiary focus:border-transparent transition-shadow duration-200"
                    placeholder="Enter your name"
                    value={formData.name}
                    onChange={(e) =>
                      setFormData((prev) => ({ ...prev, name: e.target.value }))
                    }
                  />

                  <label
                    htmlFor="name"
                    className="block text-sm font-medium text-wbd-primary mb-1"
                  >
                    Username
                  </label>
                  <Input
                    className="mb-4 w-full p-2 rounded border border-gray-300 focus:outline-none focus:ring-1 focus:ring-wbd-tertiary focus:border-transparent transition-shadow duration-200"
                    placeholder="Enter your username"
                    value={formData.username}
                    onChange={(e) =>
                      setFormData((prev) => ({
                        ...prev,
                        username: e.target.value,
                      }))
                    }
                  />

                  <label
                    htmlFor="current-password"
                    className="block text-sm font-medium text-wbd-primary mb-1"
                  >
                    Current Password
                  </label>
                  <div className="relative">
                    <Input
                      id="current-password"
                      type={isCurrentPasswordVisible ? "text" : "password"}
                      className="mb-4 w-full p-2 rounded border border-gray-300 focus:outline-none focus:ring-1 focus:ring-wbd-tertiary focus:border-transparent transition-shadow duration-200"
                      placeholder="Enter your current password"
                      value={formData.current_password}
                      onChange={(e) =>
                        setFormData((prev) => ({
                          ...prev,
                          current_password: e.target.value,
                        }))
                      }
                    />
                    <button
                      type="button"
                      className="absolute inset-y-0 right-2 flex items-center text-wbd-primary"
                      onClick={() =>
                        setIsCurrentPasswordVisible(!isCurrentPasswordVisible)
                      }
                    >
                      {isCurrentPasswordVisible ? (
                        <EyeOff size={16} />
                      ) : (
                        <Eye size={16} />
                      )}
                    </button>
                  </div>

                  <label
                    htmlFor="new-password"
                    className="block text-sm font-medium text-wbd-primary mb-1"
                  >
                    New Password
                  </label>
                  <div className="relative">
                    <Input
                      id="new-password"
                      type={isNewPasswordVisible ? "text" : "password"}
                      className="mb-4 w-full p-2 rounded border border-gray-300 focus:outline-none focus:ring-1 focus:ring-wbd-tertiary focus:border-transparent transition-shadow duration-200"
                      placeholder="Enter your new password"
                      value={formData.new_password}
                      onChange={(e) =>
                        setFormData((prev) => ({
                          ...prev,
                          new_password: e.target.value,
                        }))
                      }
                    />
                    <button
                      type="button"
                      className="absolute inset-y-0 right-2 flex items-center text-wbd-primary"
                      onClick={() =>
                        setIsNewPasswordVisible(!isNewPasswordVisible)
                      }
                    >
                      {isNewPasswordVisible ? (
                        <EyeOff size={16} />
                      ) : (
                        <Eye size={16} />
                      )}
                    </button>
                  </div>

                  <label
                    htmlFor="confirm-password"
                    className="block text-sm font-medium text-wbd-primary mb-1"
                  >
                    Confirm Password
                  </label>
                  <div className="relative">
                    <Input
                      id="confirm-password"
                      type={isConfirmPasswordVisible ? "text" : "password"}
                      className="mb-4 w-full p-2 rounded border border-gray-300 focus:outline-none focus:ring-1 focus:ring-wbd-tertiary focus:border-transparent transition-shadow duration-200"
                      placeholder="Confirm your new password"
                      value={formData.confirm_password}
                      onChange={(e) =>
                        setFormData((prev) => ({
                          ...prev,
                          confirm_password: e.target.value,
                        }))
                      }
                    />
                    <button
                      type="button"
                      className="absolute inset-y-0 right-2 flex items-center text-wbd-primary"
                      onClick={() =>
                        setIsConfirmPasswordVisible(!isConfirmPasswordVisible)
                      }
                    >
                      {isConfirmPasswordVisible ? (
                        <EyeOff size={16} />
                      ) : (
                        <Eye size={16} />
                      )}
                    </button>
                  </div>
                </div>
              ) : (
                <>
                  <h1 className="text-2xl font-bold text-wbd-text">
                    {profile.name}
                  </h1>
                  <p className="text-med text-wbd-text">@{profile.username}</p>
                  <p className="mt-2 text-sm text-wbd-primary cursor-pointer hover:underline" onClick={() => navigate(`/connections/user/${userId}`)}>
                    {profile.connection_count} connections
                  </p>
                  {!isConnected && !isEditing && userId !== loggedInUserId && (
                    <Button
                      className="mt-4 text-md"
                      variant="secondary"
                      onClick={() => sendRequest(userId)}
                      disabled={userId === loggedInUserId}
                    >
                      <UserRoundPlus className="mr-1" />
                      Connect
                    </Button>
                  )}
                </>
              )}
            </CardContent>
          </Card>

          <Card className="w-full max-w-3xl bg-white shadow-md rounded-lg mt-6">
            <CardHeader>
              <CardTitle className="text-wbd-text">Work History</CardTitle>
            </CardHeader>
            <CardContent>
              {isEditing ? (
                <>
                  {parseWorkHistory(formData.work_history || "").map(
                    (job, index) => (
                      <div key={index} className="mb-4 border p-4 rounded">
                        <label
                          htmlFor="name"
                          className="block text-sm font-medium text-wbd-primary mb-1"
                        >
                          Job Position
                        </label>
                        <Input
                          placeholder="Enter your job position"
                          className="mb-4 w-full p-2 rounded border border-gray-300 focus:outline-none focus:ring-1 focus:ring-wbd-tertiary focus:border-transparent transition-shadow duration-200"
                          value={job.position}
                          onChange={(e) => {
                            const updatedValue = e.target.value;
                            setFormData((prev) => {
                              const updatedWorkHistory = parseWorkHistory(
                                prev.work_history || "",
                              );
                              updatedWorkHistory[index] = {
                                ...updatedWorkHistory[index],
                                position: updatedValue,
                              };
                              return {
                                ...prev,
                                work_history:
                                  formatWorkHistory(updatedWorkHistory),
                              };
                            });
                          }}
                        />

                        <label
                          htmlFor="name"
                          className="block text-sm font-medium text-wbd-primary mb-1"
                        >
                          Company
                        </label>
                        <Input
                          placeholder="Enter the company name"
                          className="mb-4 w-full p-2 rounded border border-gray-300 focus:outline-none focus:ring-1 focus:ring-wbd-tertiary focus:border-transparent transition-shadow duration-200"
                          value={job.company}
                          onChange={(e) => {
                            const updatedValue = e.target.value;
                            setFormData((prev) => {
                              const updatedWorkHistory = parseWorkHistory(
                                prev.work_history || "",
                              );
                              updatedWorkHistory[index] = {
                                ...updatedWorkHistory[index],
                                company: updatedValue,
                              };
                              return {
                                ...prev,
                                work_history:
                                  formatWorkHistory(updatedWorkHistory),
                              };
                            });
                          }}
                        />

                        <label
                          htmlFor="name"
                          className="block text-sm font-medium text-wbd-primary mb-1"
                        >
                          Starting Date
                        </label>
                        <Input
                          placeholder="Enter the start date"
                          className="mb-4 w-full p-2 rounded border border-gray-300 focus:outline-none focus:ring-1 focus:ring-wbd-tertiary focus:border-transparent transition-shadow duration-200"
                          value={job.start_date}
                          onChange={(e) => {
                            const updatedValue = e.target.value;
                            setFormData((prev) => {
                              const updatedWorkHistory = parseWorkHistory(
                                prev.work_history || "",
                              );
                              updatedWorkHistory[index] = {
                                ...updatedWorkHistory[index],
                                start_date: updatedValue,
                              };
                              return {
                                ...prev,
                                work_history:
                                  formatWorkHistory(updatedWorkHistory),
                              };
                            });
                          }}
                        />

                        <label
                          htmlFor="name"
                          className="block text-sm font-medium text-wbd-primary mb-1"
                        >
                          Ending Date
                        </label>
                        <Input
                          placeholder="Enter the end date"
                          className="mb-4 w-full p-2 rounded border border-gray-300 focus:outline-none focus:ring-1 focus:ring-wbd-tertiary focus:border-transparent transition-shadow duration-200"
                          value={job.end_date}
                          onChange={(e) => {
                            const updatedValue = e.target.value;
                            setFormData((prev) => {
                              const updatedWorkHistory = parseWorkHistory(
                                prev.work_history || "",
                              );
                              updatedWorkHistory[index] = {
                                ...updatedWorkHistory[index],
                                end_date: updatedValue,
                              };
                              return {
                                ...prev,
                                work_history:
                                  formatWorkHistory(updatedWorkHistory),
                              };
                            });
                          }}
                        />

                        <Button
                          variant="destructive"
                          className="mt-2"
                          onClick={() => {
                            setFormData((prev) => {
                              const updatedWorkHistory = parseWorkHistory(
                                prev.work_history || "",
                              );
                              updatedWorkHistory.splice(index, 1);
                              return {
                                ...prev,
                                work_history:
                                  formatWorkHistory(updatedWorkHistory),
                              };
                            });
                          }}
                        >
                          Remove
                        </Button>
                      </div>
                    ),
                  )}

                  <Button
                    className="w-full"
                    variant="default"
                    onClick={() =>
                      setFormData((prev) => {
                        const updatedWorkHistory = parseWorkHistory(
                          prev.work_history || "",
                        );
                        updatedWorkHistory.push({
                          position: "",
                          company: "",
                          start_date: "",
                          end_date: "",
                        });
                        return {
                          ...prev,
                          work_history: formatWorkHistory(updatedWorkHistory),
                        };
                      })
                    }
                  >
                    Add Work Experience
                  </Button>
                </>
              ) : profile.work_history?.trim() ? (
                <div className="space-y-4">
                  {parseWorkHistoryForDisplay(profile.work_history || "").map(
                    (job, index) => (
                      <div key={index} className="border p-4 rounded">
                        <h3 className="font-semibold text-lg text-wbd-text">
                          {job.position}
                        </h3>
                        <p className="text-wbd-text">{job.company}</p>
                        <p className="text-sm text-gray-500">
                          {job.start_date} - {job.end_date}
                        </p>
                      </div>
                    ),
                  )}
                </div>
              ) : (
                <p>No working experience has been added.</p>
              )}
            </CardContent>
          </Card>

          <Card className="w-full max-w-3xl bg-white shadow-md rounded-lg mt-6">
            <CardHeader>
              <CardTitle className="text-wbd-text">Skills</CardTitle>
            </CardHeader>
            <CardContent>
              {isEditing ? (
                <div>
                  <div className="flex items-center gap-2 mb-4">
                    <Input
                      className="flex-grow p-2 rounded border border-gray-300 focus:outline-none focus:ring-1 focus:ring-wbd-tertiary focus:border-transparent transition-shadow duration-200"
                      placeholder="Add a new skill"
                      value={formData.new_skill || ""}
                      onChange={(e) =>
                        setFormData((prev) => ({
                          ...prev,
                          new_skill: e.target.value,
                        }))
                      }
                    />
                    <button
                      className="px-2 py-2 text-wbd-primary"
                      onClick={() => {
                        if (formData.new_skill?.trim()) {
                          setFormData((prev) => ({
                            ...prev,
                            skills: [
                              ...prev.skills.split(",").filter(Boolean),
                              prev.new_skill.trim(),
                            ].join(","),
                            new_skill: "",
                          }));
                        }
                      }}
                    >
                      <Plus size={24} />
                    </button>
                  </div>

                  {formData.skills.trim() && (
                    <div className="flex flex-wrap gap-2">
                      {formData.skills.split(",").map((skill, idx) => (
                        <Badge
                          key={idx}
                          className="text-sm text-wbd-text bg-wbd-highlight px-3 py-1 flex items-center"
                        >
                          {skill.trim()}
                          <button
                            className="ml-2"
                            onClick={() => {
                              setFormData((prev) => ({
                                ...prev,
                                skills: prev.skills
                                  .split(",")
                                  .filter((_, i) => i !== idx)
                                  .join(","),
                              }));
                            }}
                          >
                            <X size={16} />
                          </button>
                        </Badge>
                      ))}
                    </div>
                  )}
                </div>
              ) : profile.skills?.trim() ? (
                <div className="flex flex-wrap gap-2">
                  {profile.skills.split(",").map((skill, idx) => (
                    <Badge
                      key={idx}
                      className="text-sm text-wbd-text bg-wbd-highlight px-3 py-1"
                    >
                      {skill.trim()}
                    </Badge>
                  ))}
                </div>
              ) : (
                <p>No skills have been added.</p>
              )}
            </CardContent>
          </Card>

          {!isEditing && (
            <Card className="w-full max-w-3xl bg-white shadow-md rounded-lg mt-6">
              <CardHeader>
                <CardTitle className="text-wbd-text">Relevant Posts</CardTitle>
              </CardHeader>
              <CardContent>
                {profile.relevant_posts && profile.relevant_posts.length > 0 ? (
                  <ul className="list-disc list-inside">
                    {profile.relevant_posts.map((post) => (
                      <li key={post.id}>
                        {post.content} (Posted on{" "}
                        {new Date(post.created_at).toLocaleDateString()})
                      </li>
                    ))}
                  </ul>
                ) : (
                  <p>No relevant posts.</p>
                )}
              </CardContent>
            </Card>
          )}

          {isEditing && (
            <div className="flex justify-between space-x-6 mt-6">
              <Button
                className="text-center w-20"
                onClick={updateProfile}
                disabled={!formData.name && !formData.username}
              >
                Save
              </Button>
              <Button
                className="text-center w-20"
                variant="destructive"
                onClick={() => setIsEditing(false)}
              >
                Cancel
              </Button>
            </div>
          )}
        </>
      ) : (
        <p>No profile data available.</p>
      )}
    </div>
  );
}
