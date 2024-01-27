import React, { useState } from "react";
import axios from "axios";
import { ToastContainer, toast } from "react-toastify";
import { Link, Navigate, useNavigate } from "react-router-dom";
import { loginURL } from "../../../api";



const Login = () => {
  const navigate = useNavigate();
  const [timeoutId, setTimeoutId] = useState(null);
  const [showPassword, setShowPassword] = useState(false);



  const handleNavigation = () => {
    const id = setTimeout(() => {
      navigate('/user-chat')
      window.location.reload();
    }, 2000);

    setTimeoutId(id);
  };

  const [formData, setFormData] = React.useState({
    identifier: "",
    password: "",
  });
  const [errors, setErrors] = React.useState({
    identifier: "",
    password: "",
  });

  const handleChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value,
    });
    validateInput(e.target.name, e.target.value);
  };

  const togglePasswordVisibility = () => {
    setShowPassword((prevShowPassword) => !prevShowPassword);
  };

  const validateInput = (name, value) => {
    switch (name) {
      case "identifier":
        const emailRegex = /^\S+@\S+\.\S+$/;
        const isEmail = emailRegex.test(value);
        const isUsername = value.length >= 3;

        setErrors((prevErrors) => ({
          ...prevErrors,
          identifier: isEmail || isUsername ? "" : "Invalid email or username",
        }));
        break;
      case "password":
        setErrors((prevErrors) => ({
          ...prevErrors,
          password:
            value.length >= 8
              ? ""
              : "Password must be at least 8 characters long",
        }));
        break;
      default:
        break;
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    try {
      // Check if there are any validation errors
      if (Object.values(errors).some((error) => error !== "")) {
        console.error("Form has validation errors");
        return;
      }
      // console.log("Form Data:", formData);

      const response = await axios.post(loginURL, formData);

      if (response.status === 201 || response.status === 200) {
        const token = response?.data?.response[0]?.token;
        localStorage.setItem("token", token);
        clearForm();
        toast.success("login successfully!");
        handleNavigation();
     
      } else {
        toast.error(response.data.message);
      }
    } catch (error) {
      toast.error(error?.response?.data?.message);
      console.error("Error submitting form:", error);
    }

    // return () => {
    //   if (timeoutId) {
    //     clearTimeout(timeoutId);
    //   }
    // };
  };

  const clearForm = () => {
    setFormData({
      identifier: "",
      password: "",
    });
    setErrors({
      identifier: "",
      password: "",
    });
  };

  return (
    <section className="bg-white dark:bg-gray-900  ">
    <div className="flex flex-col items-center justify-center px-6 py-8 mx-auto md:h-screen lg:py-0">
      <div className="w-full bg-gray-200 rounded-lg shadow dark:border md:mt-0 sm:max-w-md xl:p-0 dark:bg-gray-800 dark:border-gray-700">
        <div className="p-6 space-y-4 md:space-y-6 sm:p-8">
          <h1 className="text-xl font-bold leading-tight tracking-tight text-gray-900 md:text-2xl dark:text-white">
            Sign in to your account
          </h1>
          <form
            onSubmit={handleSubmit}
            className="space-y-4 md:space-y-6"
            action="#"
          >
            <div>
              <label
                htmlFor="email"
                className="block mb-2 text-sm font-medium text-gray-900 dark:text-white"
              >
                Your Email or Username"
              </label>
              <input
                type="text"
                name="identifier"
                id="identifier"
                onChange={handleChange}
                value={formData.identifier}
                className="bg-gray-50 border border-gray-300 text-gray-900 sm:text-sm rounded-lg focus:ring-primary-600 focus:border-primary-600 block w-full p-2.5 dark:bg-gray-700 dark:border-gray-600 dark:placeholder-gray-400 dark:text-white dark:focus:ring-blue-500 dark:focus:border-blue-500"
                placeholder="Email or Username"
              />
              {errors.identifier && (
                <p className="error text-red-500">{errors.identifier}</p>
              )}
            </div>
            <div>
              <label
                htmlFor="password"
                className="block mb-2 text-sm font-medium text-gray-900 dark:text-white"
              >
                Password
              </label>
              <input
                type={showPassword ? "text" : "password"}
                name="password"
                id="password"
                onChange={handleChange}
                value={formData.password}
                placeholder="••••••••"
                className="bg-gray-50 border border-gray-300 text-gray-900 sm:text-sm rounded-lg focus:ring-primary-600 focus:border-primary-600 block w-full p-2.5 dark:bg-gray-700 dark:border-gray-600 dark:placeholder-gray-400 dark:text-white dark:focus:ring-blue-500 dark:focus:border-blue-500"
                required=""
              />
              <button
                type="button"
                onClick={togglePasswordVisibility}
                className="text-gray-500 dark:text-gray-300 focus:outline-none"
              >
                {showPassword ? "Hide" : "Show"} Password
              </button>
              {errors.password && (
                <p className="error text-red-500">{errors.password}</p>
              )}
            </div>
            <div className="flex items-center justify-between">
              <div></div>
              <Link
                to="/forgot-password"
                className="text-sm font-medium text-primary-600 hover:underline dark:text-primary-500"
              >
                Forgot password?
              </Link>
            </div>
            <button
              type="submit"
              className="w-full text-white  bg-[#03c9d7] hover:bg-primary-700 focus:ring-4 focus:outline-none focus:ring-primary-300 font-medium rounded-lg text-sm px-5 py-2.5 text-center dark:bg-primary-600 dark:hover:bg-primary-700 dark:focus:ring-primary-800"
            >
              Sign in
            </button>
          </form>
        </div>
      </div>
    </div>
    </section>
  )
}

export default Login