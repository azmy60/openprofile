import { useAtom } from "jotai";
import { produce } from "immer";
import { profileAtom } from "./state";
import SimpleInput from "@ui/SimpleInput";

export interface Profile {
  photo: string;
  name: string;
  jobTitle: string;
  email: string;
  tel: string;
  location: string;
  link: string;
  link2: string;
  link3: string;
}

export const ProfileForm: React.FC = () => {
  const [profile, setProfile] = useAtom(profileAtom);

  function updateProfile(name: keyof Profile, value: string) {
    setProfile(
      produce((draft) => {
        draft[name] = value;
      }),
    );
  }

  function onChangePhoto(e: React.ChangeEvent<HTMLInputElement>) {
    const files = e.currentTarget.files;
    if (!files) return;
    const reader = new FileReader();
    reader.addEventListener("load", () =>
      updateProfile("photo", reader.result as string),
    );
    reader.readAsDataURL(files[0]);
  }

  return (
    <div>
      <div className="text-lg font-bold">Personal</div>
      <div className="grid grid-cols-2 pt-2 gap-4">
        <SimpleInput
          label="Name"
          name="name"
          value={profile.name}
          onChange={(_, value) => updateProfile("name", value)}
        />
        <SimpleInput
          label="Job Title"
          name="jobTitle"
          value={profile.jobTitle}
          onChange={(_, value) => updateProfile("jobTitle", value)}
        />
        <SimpleInput
          label="Location"
          name="location"
          value={profile.location}
          onChange={(_, value) => updateProfile("location", value)}
        />
        <SimpleInput
          label="Telephone"
          name="tel"
          value={profile.tel}
          onChange={(_, value) => updateProfile("tel", value)}
        />
        <SimpleInput
          label="Email"
          type="email"
          name="email"
          value={profile.email}
          onChange={(_, value) => updateProfile("email", value)}
        />
        <SimpleInput
          label="Link"
          name="link"
          value={profile.link}
          onChange={(_, value) => updateProfile("link", value)}
        />
        <SimpleInput
          label="Link 2"
          name="link2"
          value={profile.link2}
          onChange={(_, value) => updateProfile("link2", value)}
        />
        <SimpleInput
          label="Link 3"
          name="link3"
          value={profile.link3}
          onChange={(_, value) => updateProfile("link3", value)}
        />
        {profile.photo ? (
          <button
            className="text-indigo-600 font-bold text-sm justify-self-start hover:underline"
            onClick={() => updateProfile("photo", "")}
          >
            Remove photo
          </button>
        ) : (
          <SimpleInput
            label="Photo"
            type="file"
            name="photo"
            onChange={onChangePhoto}
            inputProps={{
              accept: "image/*",
              className:
                "mt-1 text-sm file:mr-4 file:py-1 file:px-2 file:rounded-full file:border-0 file:text-sm file:font-semibold file:bg-gray-50 file:text-gray-700 hover:file:bg-gray-100",
            }}
          />
        )}
      </div>
    </div>
  );
};
