import React, { useState } from "react";
import { useEffect } from "react";
import { useDispatch, useSelector } from "react-redux";
import { useRef } from "react";
import {
  getDownloadURL,
  getStorage,
  ref,
  uploadBytesResumable,
} from "firebase/storage";
import { app } from "../firebase.js";
import {
  updateUserStart,
  updateUserFailure,
  updateUserSuccess,
  deleteUserStart,
  deleteUserSuccess,
  deleteUserFailure,
  signOutStart,
  signOutSuccess,
  signOutFailure,
} from "../redux/user/userSlice.js";
import { Link } from "react-router-dom";

function Profile() {
  const fileRef = useRef(null);
  const dispatch = useDispatch();
  const { currentUser, loading, error } = useSelector((state) => state.user);
  const [file, setFile] = useState(undefined);
  const [fileUploadError, setFileUploadError] = useState(false);
  const [filePerc, setFilePerc] = useState(0);
  const [formData, setFormData] = useState({});
  const [successMessage, setSuccessMessage] = useState("");
  const [updateSuccess, setUpdateSuccess] = useState(false);
  const [showlistingsError, setShowListingsError] = useState();
  const [listings, setListings] = useState([]);
  // console.log(formData);
  // console.log(fileUploadError);
  // console.log(filePerc);

  useEffect(() => {
    if (file) {
      handleFileUpload(file);
    }
  }, [file]);

  const handleFileUpload = (file) => {
    const storage = getStorage(app);
    const fileName = new Date().getTime() + file.name;
    const storageRef = ref(storage, fileName);
    const uploadTask = uploadBytesResumable(storageRef, file);

    uploadTask.on(
      "state_changed",
      (snapshot) => {
        const progress =
          (snapshot.bytesTransferred / snapshot.totalBytes) * 100;
        setFilePerc(Math.round(progress));
      },
      (error) => {
        setFileUploadError(true);
      },
      () => {
        getDownloadURL(uploadTask.snapshot.ref).then((downloadURL) => {
          setFormData({ ...formData, avatar: downloadURL });
          setSuccessMessage("Image Successfully Uploaded !");

          // Hide the success message after 4 seconds
          setTimeout(() => {
            setSuccessMessage();
          }, 3000);
        });
      }
    );
  };
  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.id]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      dispatch(updateUserStart());
      const res = await fetch(`/api/user/update/${currentUser._id}`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(formData),
      });
      const data = await res.json();

      if (data.success === false) {
        dispatch(updateUserFailure(data.message));
        return;
      }
      dispatch(updateUserSuccess(data));
      setUpdateSuccess(true);
    } catch (error) {
      dispatch(updateUserFailure(error.message));
    }
  };

  const handleDeletedUser = async () => {
    try {
      dispatch(deleteUserStart());
      const res = await fetch(`/api/user/delete/${currentUser._id}`, {
        method: "DELETE",
      });

      const data = await res.json();
      if (data.success === false) {
        dispatch(deleteUserFailure(data.message));
        return;
      }
      dispatch(deleteUserSuccess(data));
    } catch (error) {
      dispatch(deleteUserFailure(error.message));
    }
  };

  const handleSignOut = async () => {
    try {
      dispatch(signOutStart());
      const res = await fetch("/api/auth/signout");
      const data = await res.json();
      if (data.success === false) {
        dispatch(signOutFailure(data.message));
        return;
      }
      dispatch(signOutSuccess(data));
    } catch (error) {
      dispatch(signOutFailure(data.message));
    }
  };

  const handleShowListing = async () => {
    try {
      setShowListingsError(false);
      const res = await fetch(`/api/user/listing/${currentUser._id}`);
      const data = await res.json();
      if (data.success === false) {
        setShowListingsError(true);
        return;
      }
      setListings(data);
    } catch (error) {
      setShowListingsError(true);
    }
  };

  const handleDeleteListing = async (listingId) => {
    try {
      const res = await fetch(`/api/listing/delete/${listingId}`, {
        method: "DELETE",
      });
      const data = await res.json();
      if(data.success === false){
        console.log(data.message);
        return;
      }

      setListings((prev)=> prev.filter((listing)=>listing._id !== listingId))
    } catch (error) {
      console.log(error);
    }
  };
  return (
    <div className="py-3 max-w-lg mx-auto">
      <h1 className="text-3xl font-semibold text-center my-7">
        {" "}
        Update Profile
      </h1>

      <form onSubmit={handleSubmit} className="flex flex-col gap-4">
        <input
          onChange={(e) => setFile(e.target.files[0])}
          type="file"
          ref={fileRef}
          hidden
          accept="image/*"
        />
        <img
          onClick={() => fileRef.current.click()}
          className="rounded-full h-20 w-20 object-cover cursor-pointer self-center mt-2"
          src={formData.avatar || currentUser.avatar}
          alt="profile"
        />
        <p className="text-sm text-center">
          {fileUploadError ? (
            <span className="red-700">
              {" "}
              Error Image upload ( Image must be less than 2 MB)
            </span>
          ) : filePerc > 0 && filePerc < 100 ? (
            <span className="tex-green-700">{`Uploading ${filePerc} %`}</span>
          ) : successMessage ? (
            <span className="text-green-700">{successMessage}</span>
          ) : (
            " "
          )}
        </p>

        <input
          type="text"
          placeholder="username"
          id="username"
          className="border p-3 rounded-lg mt-5"
          defaultValue={currentUser.username}
          onChange={handleChange}
        />
        <input
          type="email"
          placeholder="email"
          id="email"
          defaultValue={currentUser.email}
          className="border p-3 rounded-lg mt-5"
          onChange={handleChange}
        />
        <input
          type="password"
          placeholder="password"
          id="password"
          defaultValue={currentUser.password}
          className="border p-3 rounded-lg mt-5"
          onChange={handleChange}
        />
        <button className="bg-slate-700 text-white rounded-lg p-3 mt-5 uppercase hover:opacity-80">
          {" "}
          {loading ? "Updating..." : "Update"}
        </button>
        <Link
          className="bg-green-700 text-white rounded-lg p-3 mt-5 text-center uppercase hover:opacity-80"
          to={"/create-listing"}
        >
          Create Listing
        </Link>
      </form>

      <div className="flex justify-between mt-5">
        <span
          onClick={handleDeletedUser}
          className="text-red-700 cursor-pointer"
        >
          Delete Account
        </span>
        <span onClick={handleSignOut} className="text-red-700 cursor-pointer">
          Sign out
        </span>
      </div>
      {/* <p className="text-red-700 mt-5">{error ? error : ""}</p> */}
      <p className="text-green-700 mt-5">
        {updateSuccess ? "Profile updated successfully !" : ""}
      </p>
      <button onClick={handleShowListing} className="text-green-700 w-full ">
        Show Listings 
      </button>
      <p className="text-red-700 mt-5">
        {showlistingsError ? "Error showing listings" : ""}
      </p>
      {listings && listings.length > 0 && (
        <div className=" flex flex-col gap-4">
          <h1 className="text-center mt-7 text-2xl font-semibold text-gray-700">
            {" "}
            Your Listings
          </h1>
          {listings.map((listing) => (
            <div
              key={listing._id}
              className=" gap-4 border rounded-lg p-3 flex justify-between items-center"
            >
              <Link to={`/listing/${listing._id}`}>
                <img
                  src={listing.imageUrls[0]}
                  alt="listing cover"
                  className="h-16 w-16 object-cover rounded-lg mt-3"
                />
              </Link>

              <Link
                className=" flex-1 text-slate-700 font-semibold  hover:underline truncate"
                to={`/listing/${listing._id}`}
              >
                <p>{listing.name}</p>
              </Link>
              <div className=" flex flex-col items-center">
                <button
                  onClick={() => handleDeleteListing(listing._id)}
                  className="text-red-700 font-semibold hover:opacity-75 uppercase"
                >
                  Delete
                </button>
              <Link to = {`/update-listing/${listing._id}`}>
                <button  className="text-green-700 font-semibold  hover:opacity-75 uppercase">
                  Edit
                </button>
              </Link>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

export default Profile;
