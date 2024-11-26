import { useEffect, useState } from "react";
import { useParams } from "react-router-dom";
import toast from "react-hot-toast";
import { Button } from "../components/ui/button";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from "../components/ui/card";
import { Input } from "../components/ui/input";

type ProfileData = {
  username: string;
  name: string;
  profile_photo: string | null;
  connection_count: number;
  work_history?: string;
  skills?: string;
  relevant_posts?: { id: string; content: string; created_at: string }[];
};

export default function Profile() {
  const { userId } = useParams<{ userId: string }>();
  const [profile, setProfile] = useState<ProfileData | null>(null);
  const [isEditing, setIsEditing] = useState(false);
  const [formData, setFormData] = useState({
    username: "",
    name: "",
    work_history: "",
    skills: "",
    profile_photo: null as File | null,
  });
  const [photoUrl, setPhotoUrl] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);

  if (!userId) {
    toast.error("User ID is required to view the profile.");
    return <div className="text-center text-red-500">User ID is missing.</div>;
  }

  const fetchProfile = async () => {
    setIsLoading(true);
    try {
      const response = await fetch(
        `http://localhost:3000/api/profile/${userId}`,
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
        });

        if (data.body.profile_photo) {
          setPhotoUrl(data.body.profile_photo);
        }
      }

      toast.success("Profile fetched successfully");
    } catch (error) {
      console.error(error);
      toast.error("Error fetching profile");
    } finally {
      setIsLoading(false);
    }
  };

  const updateProfile = async () => {
    const toastId = toast.loading("Updating profile...");
    try {
      const form = new FormData();
      form.append("username", formData.username);
      form.append("name", formData.name);
      form.append("work_history", formData.work_history);
      form.append("skills", formData.skills);

      if (formData.profile_photo) {
        form.append("profile_photo", formData.profile_photo);
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
        throw new Error("Failed to update profile");
      }

      toast.success("Profile updated successfully");
      setIsEditing(false);
      fetchProfile();
    } catch (error) {
      console.error(error);
      toast.error("Error updating profile");
    } finally {
      toast.dismiss(toastId);
    }
  };

  useEffect(() => {
    fetchProfile();
  }, [userId]);

  return (
    <div className="flex flex-col items-center min-h-screen bg-gray-100 p-4 text-black">
      <h1 className="text-2xl font-bold mb-4">Profile for User ID: {userId}</h1>

      {isLoading ? (
        <p>Loading...</p>
      ) : profile ? (
        <Card className="w-full max-w-md">
          <CardHeader>
            <CardTitle>Profile Details</CardTitle>
          </CardHeader>
          <CardContent>
            {isEditing ? (
              <>
                <div className="mb-4">
                  <label className="block mb-1">Username</label>
                  <Input
                    type="text"
                    value={formData.username}
                    onChange={(e) =>
                      setFormData((prev) => ({
                        ...prev,
                        username: e.target.value,
                      }))
                    }
                  />
                </div>
                <div className="mb-4">
                  <label className="block mb-1">Name</label>
                  <Input
                    type="text"
                    value={formData.name}
                    onChange={(e) =>
                      setFormData((prev) => ({ ...prev, name: e.target.value }))
                    }
                  />
                </div>
                <div className="mb-4">
                  <label className="block mb-1">Work History</label>
                  <Input
                    type="text"
                    value={formData.work_history}
                    onChange={(e) =>
                      setFormData((prev) => ({
                        ...prev,
                        work_history: e.target.value,
                      }))
                    }
                  />
                </div>
                <div className="mb-4">
                  <label className="block mb-1">Skills</label>
                  <Input
                    type="text"
                    value={formData.skills}
                    onChange={(e) =>
                      setFormData((prev) => ({
                        ...prev,
                        skills: e.target.value,
                      }))
                    }
                  />
                </div>
                <div className="mb-4">
                  <label className="block mb-1">Profile Photo</label>
                  <Input
                    type="file"
                    accept="image/*"
                    onChange={(e) => {
                      if (e.target.files && e.target.files[0]) {
                        setFormData((prev) => ({
                          ...prev,
                          profile_photo: e.target.files![0],
                        }));
                      }
                    }}
                  />
                </div>
                <Button onClick={updateProfile} className="mr-2">
                  Save
                </Button>
                <Button
                  variant="destructive"
                  onClick={() => setIsEditing(false)}
                >
                  Cancel
                </Button>
              </>
            ) : (
              <>
                <p>
                  <strong>Username:</strong> {profile.username}
                </p>
                <p>
                  <strong>Name:</strong> {profile.name}
                </p>
                <p>
                  <strong>Work History:</strong> {profile.work_history || "N/A"}
                </p>
                <p>
                  <strong>Skills:</strong> {profile.skills || "N/A"}
                </p>
                <p>
                  <strong>Connection Count:</strong> {profile.connection_count}
                </p>
                {photoUrl && (
                  <img
                    src={photoUrl}
                    alt="Profile"
                    className="w-20 h-20 rounded-full mt-4"
                  />
                )}
                {profile.relevant_posts && (
                  <div>
                    <strong>Relevant Posts:</strong>
                    <ul>
                      {profile.relevant_posts.map((post) => (
                        <li key={post.id}>
                          {post.content} (Posted on{" "}
                          {new Date(post.created_at).toLocaleDateString()})
                        </li>
                      ))}
                    </ul>
                  </div>
                )}
                <Button onClick={() => setIsEditing(true)} className="mt-4">
                  Edit Profile
                </Button>
              </>
            )}
          </CardContent>
        </Card>
      ) : (
        <p>No profile data available.</p>
      )}
    </div>
  );
}
