import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { URL } from "../App";
import axios from "axios";
import churchLogo from "../assets/ChristChurchLogo.jpg";
import { SuccessMessage, FailedMessage } from "../Components/ToastMessage";

function Login() {
  const navigate = useNavigate();

  // UI states
  const [tab, setTab] = useState("login"); // "login" | "signup"
  const [PasswordVisible, setPasswordVisible] = useState(false);

  const [Response, setResponse] = useState({ status: null, message: "" });

  // Signup states
  const [memberId, setMemberId] = useState("");
  const [email, setEmail] = useState("");
  const [otpSent, setOtpSent] = useState(false);
  const [otpVerified, setOtpVerified] = useState(false);
  const [signupStep, setSignupStep] = useState(1);
  const [otp, setOtp] = useState("");
  const [otpError, setOtpError] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [maskedEmail, setMaskedEmail] = useState("");
  const [sendingOtp, setSendingOtp] = useState(false);
  const [checkingMember, setCheckingMember] = useState(false);
  const [verifyingOtp, setVerifyingOtp] = useState(false);
  const [signingUp, setSigningUp] = useState(false);
  const [otpTimer, setOtpTimer] = useState(0);
  const [memberResponse, setMemberResponse] = useState("");
  const [loginOtp, setLoginOtp] = useState("");
  const [otpStep, setOtpStep] = useState(false);
  // const [maskedMobile, setMaskedMobile] = useState("");
  const [maskedLoginEmail, setMaskedLoginEmail] = useState("");
  const [loginTimer, setLoginTimer] = useState(0);
  const [treasurerName, setTreasurerName] = useState("");
  const [loginOtpExpired, setLoginOtpExpired] = useState(false);

  const [loggingIn, setLoggingIn] = useState(false);
  const [showForgot, setShowForgot] = useState(false);
  const [forgotMode, setForgotMode] = useState(false);
  const [loginMemberId, setLoginMemberId] = useState("");

  const [showPasswordRules, setShowPasswordRules] = useState(false);


  const [createPasswordVisible, setCreatePasswordVisible] = useState(false);
  const [confirmPasswordVisible, setConfirmPasswordVisible] = useState(false);





  //treasurer otp login
  const handleLogin = async (event) => {

    event.preventDefault();

    if (loggingIn) return;

    setLoggingIn(true);

    const data = {
      username: loginMemberId,
      password: otpStep ? undefined : event.target.password?.value,
      otp: otpStep ? loginOtp : undefined
    };

    try {
      const response = await axios.post(`${URL}/login`, data);

      // ================= TREASURER OTP HANDLING =================
      // if (response.data.step === "OTP_REQUIRED") {
      //   setOtpStep(true);
      //   setMaskedMobile(response.data.mobile);
      //   // setResponse(true);
      //   // setResponseColor("text-green-600");
      //   // setResponseMessage(`Enter OTP sent to ${response.data.mobile}`);
      //   setLoginTimer(180);
      //   setLoginOtpExpired(false);
      //   return;
      // }

      if (response.data.step === "OTP_REQUIRED") {

        setOtpStep(true);

        setTreasurerName(response.data.member_name);

// setMaskedLoginEmail if get isssus use this maskEmail(response.data.email)

        setMaskedLoginEmail(
          maskEmail(response.data.primary_email)
        );

        setLoginTimer(180);

        setLoginOtpExpired(false);

        setResponse({
          status: "Success",
          message: "OTP Sent To Registered Email"
        });

        return;
      }

      // ==========================================================

      // ======= YOUR ORIGINAL CODE (UNTOUCHED) =======
      window.sessionStorage.setItem("token", response.data.token);
      sessionStorage.setItem("loginTime", Date.now());
      localStorage.removeItem("role")

      const payload = JSON.parse(atob(response.data.token.split(".")[1]));
      const roles = payload.roles || [];

      setResponse({
        status: "Success",
        message: "Login Successful"
      });

      setTimeout(() => {

        resetLoginForm();  // ⭐ ADD

        if (roles.includes("member"))
          navigate("/admin/dashmember");
        else
          navigate("/admin/dashboard");

      }, 1000);
      // ==============================================

    } catch (error) {
      console.error(error);
      const memberExists = error.response?.data?.memberExists;

      setResponse({
        status: "Failed",
        message: memberExists ? "Incorrect Password" : "Login Failed"
      });

      if (memberExists) {

        setShowForgot(true);

      }
      else {

        setShowForgot(false);

      }
    } finally {

      setLoggingIn(false);

      setTimeout(() => setResponse({ status: null, message: "" }), 2000);

    }
  };

  const handleForgotPassword = async () => {

    if (!loginMemberId) return;

    try {

      const res = await axios.post(`${URL}/signup-check`, {
        member_id: loginMemberId,
        mode: "forgot"
      });

      setEmail(res.data.email);


      setMaskedEmail(maskEmail(res.data.email));
      setMemberId(loginMemberId);
      setForgotMode(true);

      setTab("signup");

      setSignupStep(2);

    } catch (err) {

      setResponse({
        status: "Failed",
        message: "Member not found"
      });

    }

  };


  const resetLoginForm = () => {

    setOtpStep(false);

    setLoginOtp("");

    setMaskedLoginEmail("");

    setLoginTimer(0);

    setLoginOtpExpired(false);

    setLoginMemberId("");

    setShowForgot(false);

    setLoggingIn(false);

    setTreasurerName("");

    setResponse({ status: null, message: "" });

    // ⭐ Clear password input
    const pwd = document.querySelector("input[name='password']");
    if (pwd) pwd.value = "";

  };


  useEffect(() => {
    if (!otpStep || loginTimer <= 0) return;

    const i = setInterval(() => {
      setLoginTimer(t => {
        if (t <= 1) {
          clearInterval(i);
          setLoginOtpExpired(true);
          resetLoginForm();   // auto reset after expiry
          return 0;
        }
        return t - 1;
      });
    }, 1000);

    return () => clearInterval(i);
  }, [otpStep, loginTimer]);





  //created at 13/01/2026 at 11.57AM with sms and email
  const handleCheckMember = async (e) => {

    e.preventDefault();

    if (checkingMember) return;

    if (!memberId.trim()) {
      setMemberResponse("Please enter Member ID");
      return;
    }

    setCheckingMember(true);

    setMemberResponse("Fetching member details...");

    try {

      const res = await axios.post(`${URL}/signup-check`, {
        member_id: memberId.trim()
      });

      const receivedEmail = res.data.email;

      if (!receivedEmail) {
        setMemberResponse(
          "Primary Email not registered. Please contact Church Office."
        );
        return;
      }

      setEmail(receivedEmail);
      setMaskedEmail(maskEmail(receivedEmail));
      setSignupStep(2);
      setMemberResponse("Member verified successfully");

      setResponse({
        status: "Success",
        message: "Member Verified Successfully"
      });

    } catch (err) {

      const msg = err.response?.data?.message;

      if (msg === "Member/Pastor not found")
        setMemberResponse("Member ID does not exist");

      else if (msg === "Primary Email not registered")
        setMemberResponse(
          "Primary Email not registered. Please contact Church Office."
        );

      else if (msg === "User already exists, please login.") {

        setMemberResponse("User already exists, please login.");

        setResponse({
          status: "Failed",
          message: "User already exists. Please login."
        });

        setSignupStep(1);

      }

      else
        setMemberResponse("Unable to verify Member ID");

    } finally {

      setCheckingMember(false);

    }

  };


  const handleSendOtp = async () => {

    if (sendingOtp) return;

    setSendingOtp(true);

    try {

      await axios.post(`${URL}/signup-request`, {
        member_id: memberId,
        mode: forgotMode ? "forgot" : "signup"
      });

      setResponse({
        status: "Success",
        message: "OTP Sent Successfully"
      });

      setOtpTimer(90);

      setSignupStep(3);

    } catch (err) {

      setMemberResponse("Failed to send OTP");

    } finally {


      setSendingOtp(false);


    }

  };


  // Step 2: OTP timer countdown
  useEffect(() => {
    if (otpTimer <= 0) return;
    const timer = setInterval(() => {
      setOtpTimer(prev => prev - 1);
    }, 1000);
    return () => clearInterval(timer);
  }, [otpTimer]);

  const maskEmail = (email) => {
    if (!email) return "";

    const [name, domain] = email.split("@");

    return name.substring(0, 3) + "******@" + domain;
  };

  // Step 3: Verify OTP
  const handleVerifyOtp = async () => {

    if (verifyingOtp) return;

    if (!otp) {
      setOtpError("Please enter OTP");
      return;
    }

    setVerifyingOtp(true);

    try {

      await axios.post(`${URL}/verify-otp`, {
        member_id: memberId,
        otp
      });

      setResponse({
        status: "Success",
        message: "OTP Verified Successfully"
      });

      setSignupStep(4);
      setOtpError("");

    } catch (err) {

      setOtpError(
        err.response?.data?.message ||
        "Invalid OTP. Please recheck."
      );

    } finally {

      setVerifyingOtp(false);

    }

  };

  // Step 4: Complete signup
  const handleCompleteSignup = async () => {

    if (signingUp) return;

    if (!password) return;

    setSigningUp(true);

    try {

      if (forgotMode) {

        await axios.post(`${URL}/reset-password`, {
          member_id: memberId,
          password
        });

        setResponse({
          status: "Success",
          message: "Password Updated Successfully"
        });

      } else {

        await axios.post(`${URL}/complete-signup`, {
          member_id: memberId,
          password
        });

        setResponse({
          status: "Success",
          message: "Signup Successful"
        });

      }


      setTimeout(() => {

        resetSignupForm(); // ⭐ RESET
        setForgotMode(false);
        setShowForgot(false);
        setTab("login");

      }, 1500);

    } catch (err) {

      setResponse({
        status: "Failed",
        message: err.response?.data?.message || "Signup Failed"
      });

    } finally {

      setSigningUp(false);

    }

  };

  // ------------------- PASSWORD VALIDATION -------------------
  const isPasswordValid = () => {

    return (
      password.length >= 6 &&
      /[A-Z]/.test(password) &&
      /\d/.test(password) &&
      !/[^A-Za-z0-9]/.test(password) &&
      password === confirmPassword
    );

  };

  const hasMinLength = password.length >= 6;
  const hasCapital = /[A-Z]/.test(password);
  const hasNumber = /\d/.test(password);
  const hasSymbol = /[^A-Za-z0-9]/.test(password);




  const resetSignupForm = () => {

    setMemberId("");
    setEmail("");
    setMaskedEmail("");

    setSignupStep(1);

    setOtp("");
    setOtpError("");

    setPassword("");
    setConfirmPassword("");

    setOtpTimer(0);

    setMemberResponse("");

    setSendingOtp(false);
    setCheckingMember(false);
    setVerifyingOtp(false);
    setSigningUp(false);

  };


  useEffect(() => {
    const token = sessionStorage.getItem("token");
    if (token) {
      navigate("/admin/dashboard", { replace: true });
    }
  }, []);

  return (
    <section className="bg-[url('./assets/login-bg-min.png')] bg-cover bg-center bg-no-repeat bg-lavender--600 w-screen h-screen flex-col flex items-center justify-center">
      <div className="w-full max-w-xs p-8 bg-white border border-gray-200 shadow 2xl:max-w-lg lg:max-w-sm xl:max-w-md lg:p-10 xl:p-12 rounded-3xl sm:p-6 md:p-8 dark:bg-gray-800 dark:border-gray-700">
        {/* Church Logo & Name */}
        <div className="flex flex-col items-center">
          <img
            src={churchLogo}
            alt="CSI Christ Church Logo"
            className="w-20 h-20 object-contain mb-2"
          />
          <h2 className="text-xl font-bold text-lavender--600 text-center tracking-wide">
            CSI CHRIST CHURCH
          </h2>
        </div>

        {/* Tab Switch */}
        <div className="flex justify-around mb-6">
          <button
            className={`px-4 py-2 font-semibold ${tab === "login" ? "text-lavender--600 border-b-2 border-lavender--600" : "text-gray-400"}`}
            onClick={() => {

              setTab("login");

              resetSignupForm();
              resetLoginForm();   // ⭐ ADD THIS

              setForgotMode(false);
              setShowForgot(false);

            }}
          >
            Login
          </button>
          <button
            className={`px-4 py-2 font-semibold ${tab === "signup" ? "text-lavender--600 border-b-2 border-lavender--600" : "text-gray-400"}`}
            onClick={() => {

              setTab("signup");

              resetSignupForm();
              resetLoginForm();   // ⭐ ADD THIS

              setForgotMode(false);
              setShowForgot(false);

            }}
          >
            Signup
          </button>
        </div>


        {tab === "login" && (
          <form onSubmit={handleLogin} className="space-y-6">

            <h5 className="text-xl font-bold text-center text-lavender--600 dark:text-white">
              LOG IN
            </h5>

            {/* MEMBER ID */}
            {!otpStep && (
              <>

                {/* MEMBER ID */}

                <div className="relative">

                  <input
                    type="text"
                    name="username"
                    value={loginMemberId}
                    onChange={(e) => setLoginMemberId(e.target.value)}
                    className="block px-2.5 pb-2.5 pt-4 w-full text-sm text-gray-900 bg-transparent rounded-lg border border-gray-300 appearance-none focus:outline-none focus:ring-0 focus:border-lavender--600 peer"
                    placeholder=" "
                    required
                  />

                  <label className="absolute text-sm text-gray-500 duration-300 transform -translate-y-4 scale-75 top-2 left-2">

                    Member ID

                  </label>

                </div>


                {/* PASSWORD */}

                <div className="relative">

                  <input
                    type={PasswordVisible ? "text" : "password"}
                    name="password"
                    autoComplete="current-password"
                    className="block px-2.5 pb-2.5 pt-4 w-full text-sm text-gray-900 bg-transparent rounded-lg border border-gray-300 appearance-none focus:outline-none focus:ring-0 focus:border-lavender--600 peer"
                    placeholder=" "
                    required
                  />

                  <label className="absolute text-sm text-gray-500 duration-300 transform -translate-y-4 scale-75 top-2 left-2">
                    Password
                  </label>

                  <div className="absolute inset-y-0 right-0 flex items-center pr-4">

                    {PasswordVisible ? (

                      <i
                        onClick={() => setPasswordVisible(false)}
                        className="fa-solid fa-eye text-lavender--600 cursor-pointer"
                      />

                    ) : (

                      <i
                        onClick={() => setPasswordVisible(true)}
                        className="fa-solid fa-eye-slash text-lavender--600 cursor-pointer"
                      />

                    )}

                  </div>



                </div>

                {showForgot && !otpStep && (

                  <div className="text-right -mt-3">

                    <button
                      type="button"
                      onClick={handleForgotPassword}
                      className="text-sm text-lavender--600 hover:underline font-semibold"
                    >

                      Forgot Password?

                    </button>

                  </div>

                )}

              </>
            )}

            {/* OTP FIELD – Only for Treasurer */}
            {/* TREASURER OTP SCREEN */}
            {otpStep && (

              <div className="space-y-4 animate-fade-in">

                <div className="text-center text-green-600 font-bold">
                  <div className="text-lg">Welcome Treasurer</div>
                  <div>{treasurerName}</div>
                </div>

                <p className="text-center text-sm">

                  Enter OTP sent to your registered Email

                  <br />

                  <b>{maskedLoginEmail}</b>

                </p>


                {/* 6 Digit OTP BOXES */}

                <div className="grid grid-cols-6 gap-2 w-full">

                  {[0, 1, 2, 3, 4, 5].map((i) => (
                    <input
                      key={i}
                      type="text"
                      maxLength={1}
                      value={loginOtp[i] || ""}
                      onChange={(e) => {

                        const value = e.target.value.replace(/\D/, "");

                        let newOtp = loginOtp.split("");
                        newOtp[i] = value;

                        setLoginOtp(newOtp.join(""));

                        if (value && e.target.nextSibling) {
                          e.target.nextSibling.focus();
                        }

                      }}
                      onKeyDown={(e) => {

                        if (e.key === "Backspace" && !loginOtp[i] && e.target.previousSibling) {
                          e.target.previousSibling.focus();
                        }

                      }}
                      className="w-full aspect-square text-center border rounded-lg text-sm md:text-lg font-bold focus:border-lavender--600 focus:outline-none"
                    />
                  ))}

                </div>

                <p className="text-xs text-red-500 text-center">

                  OTP expires in {loginTimer}s

                </p>

              </div>

            )}

            {/* MESSAGE */}
            {/* {Response && (
              <div className="text-center">
                <p className={`${ResponseColor} font-semibold text-sm`}>
                  {ResponseMessage}
                </p>
              </div>
            )} */}

            {/* SUBMIT BUTTON */}
            <button
              type="submit"
              disabled={loggingIn}
              className={`w-full text-white font-medium rounded-lg text-base px-5 py-2.5 flex items-center justify-center gap-2
${loggingIn
                  ? "bg-lavender--600/60 cursor-not-allowed"
                  : "bg-lavender--600 hover:bg-lavender--700"
                }`}
            >

              {loggingIn ? (
                <>
                  <span className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                  Processing...
                </>
              ) : (
                otpStep ? "Verify OTP & Login" : "Login"
              )}

            </button>

          </form>
        )}


        {/* ------------------- SIGNUP FORM ------------------- */}
        {tab === "signup" && (

          <div className="space-y-6">

            <h5 className="text-xl font-bold text-center text-lavender--600">
              SIGN UP
            </h5>


            {/* STEP 1 */}

            {signupStep === 1 && (

              <>

                <input
                  type="text"
                  value={memberId}
                  onChange={(e) => setMemberId(e.target.value)}
                  className="block w-full border p-3 rounded-lg"
                  placeholder="Member ID"
                />
                {memberResponse && (
                  <p className="text-left text-sm mt-2 text-red-600">
                    {memberResponse}
                  </p>
                )}
                <button
                  onClick={handleCheckMember}
                  disabled={checkingMember}
                  className={`w-full p-3 rounded-lg text-white font-semibold flex items-center justify-center gap-2
${checkingMember
                      ? "bg-lavender--600/60 cursor-not-allowed"
                      : "bg-lavender--600 hover:bg-lavender--700"
                    }`}
                >

                  {checkingMember ? (
                    <>
                      <span className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                      Checking...
                    </>
                  ) : (
                    "Verify Member ID"
                  )}

                </button>


              </>

            )}



            {/* STEP 2 */}

            {signupStep === 2 && (

              <>

                <p className="text-green-600 text-center font-semibold">

                  Member Verified Successfully

                </p>


                <p className="text-center">

                  Are You Sure You Want To Send An OTP To Your Registered Mail

                  <br />

                  <b>{maskedEmail}</b>

                </p>


                <button
                  onClick={handleSendOtp}
                  disabled={sendingOtp}
                  className={`w-full p-3 rounded-lg text-white font-semibold flex items-center justify-center gap-2
${sendingOtp
                      ? "bg-lavender--600/60 cursor-not-allowed"
                      : "bg-lavender--600 hover:bg-lavender--700"
                    }`}
                >

                  {sendingOtp ? (
                    <>
                      <span className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                      Sending OTP...
                    </>
                  ) : (
                    "Send OTP"
                  )}

                </button>

              </>

            )}



            {/* STEP 3 */}

            {signupStep === 3 && (

              <>

                <p className="text-center">

                  An OTP Has Sent to Your registered Mail

                  <br />

                  <b>{maskedEmail}</b>

                </p>


                <div className="grid grid-cols-6 gap-2 w-full">

                  {[0, 1, 2, 3, 4, 5].map((i) => (
                    <input
                      key={i}
                      type="text"
                      maxLength={1}
                      value={otp[i] || ""}
                      onChange={(e) => {

                        const value = e.target.value.replace(/\D/, "");

                        let newOtp = otp.split("");
                        newOtp[i] = value;

                        setOtp(newOtp.join(""));
                        setOtpError("");

                        if (value && e.target.nextSibling) {
                          e.target.nextSibling.focus();
                        }

                      }}
                      onKeyDown={(e) => {

                        if (e.key === "Backspace" && !otp[i] && e.target.previousSibling) {
                          e.target.previousSibling.focus();
                        }

                      }}
                      className="w-full aspect-square text-center border rounded-lg text-sm md:text-lg font-bold focus:border-lavender--600 focus:outline-none"
                    />
                  ))}

                </div>


                <p className="text-red-500 text-sm">

                  {otpTimer > 0 ? `OTP Timeout ${otpTimer}s` : "OTP Timeout"}

                </p>

                {otpError && (
                  <p className="text-red-600 text-sm mt-1 text-left">
                    {otpError}
                  </p>
                )}



                {/* OTP ACTION BUTTON */}

                {otpTimer === 0 ? (

                  <button
                    onClick={handleSendOtp}
                    disabled={sendingOtp}
                    className={`w-full p-3 rounded-lg text-white font-semibold flex items-center justify-center gap-2
${sendingOtp
                        ? "bg-lavender--600/60 cursor-not-allowed"
                        : "bg-lavender--600 hover:bg-lavender--700"
                      }`}
                  >

                    {sendingOtp ? (
                      <>
                        <span className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                        Sending OTP...
                      </>
                    ) : (
                      "Resend OTP"
                    )}

                  </button>

                ) : (

                  <button
                    onClick={handleVerifyOtp}
                    disabled={verifyingOtp}
                    className={`w-full p-3 rounded-lg text-white font-semibold flex items-center justify-center gap-2
${verifyingOtp
                        ? "bg-lavender--600/60 cursor-not-allowed"
                        : "bg-lavender--600 hover:bg-lavender--700"
                      }`}
                  >

                    {verifyingOtp ? (
                      <>
                        <span className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                        Verifying...
                      </>
                    ) : (
                      "Verify OTP"
                    )}

                  </button>

                )}



              </>

            )}



            {/* STEP 4 */}

            {signupStep === 4 && (

              <>

                <h4 className="text-center font-bold text-green-600">

                  Verification Completed

                </h4>


                <div className="relative">

                  <input
                    type={createPasswordVisible ? "text" : "password"}
                    placeholder="Create Password"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    className="block w-full border p-3 rounded-lg pr-10"
                  />

                  <div className="absolute inset-y-0 right-0 flex items-center pr-3">

                    {createPasswordVisible ? (
                      <i
                        onClick={() => setCreatePasswordVisible(false)}
                        className="fa-solid fa-eye text-lavender--600 cursor-pointer"
                      />
                    ) : (
                      <i
                        onClick={() => setCreatePasswordVisible(true)}
                        className="fa-solid fa-eye-slash text-lavender--600 cursor-pointer"
                      />
                    )}

                  </div>

                </div>


                <div className="relative">

                  <input
                    type={confirmPasswordVisible ? "text" : "password"}
                    placeholder="Confirm Password"
                    value={confirmPassword}
                    onChange={(e) => setConfirmPassword(e.target.value)}
                    className="block w-full border p-3 rounded-lg pr-10"
                  />

                  <div className="absolute inset-y-0 right-0 flex items-center pr-3">

                    {confirmPasswordVisible ? (
                      <i
                        onClick={() => setConfirmPasswordVisible(false)}
                        className="fa-solid fa-eye text-lavender--600 cursor-pointer"
                      />
                    ) : (
                      <i
                        onClick={() => setConfirmPasswordVisible(true)}
                        className="fa-solid fa-eye-slash text-lavender--600 cursor-pointer"
                      />
                    )}

                  </div>

                </div>

                {/* Password Rules */}

                {showPasswordRules && (

                  <div className="text-sm space-y-1 ">

                    <p className={`m-0 ${hasMinLength ? "text-green-600" : "text-red-600"}`}>
                      {hasMinLength ? "✓" : "✗"} Minimum 6 letters
                    </p>

                    <p className={hasCapital ? "text-green-600" : "text-red-600"}>
                      {hasCapital ? "✓" : "✗"} At least 1 Capital letter
                    </p>

                    <p className={hasNumber ? "text-green-600" : "text-red-600"}>
                      {hasNumber ? "✓" : "✗"} At least 1 Number
                    </p>

                    {hasSymbol && (
                      <p className="text-red-600">
                        ✗ Symbols are not allowed
                      </p>
                    )}

                    {confirmPassword && password !== confirmPassword && (
                      <p className="text-red-600">
                        ✗ Passwords do not match
                      </p>
                    )}

                  </div>
                )}

                <button
                  disabled={signingUp}
                  onClick={() => {

                    if (!isPasswordValid()) {
                      setShowPasswordRules(true);
                      return;
                    }

                    handleCompleteSignup();

                  }}
                  className={`w-full p-3 rounded-lg text-white font-semibold flex items-center justify-center gap-2
${signingUp
                      ? "bg-lavender--600/60 cursor-not-allowed"
                      : "bg-lavender--600 hover:bg-lavender--700"
                    }`}
                >

                  {signingUp ? (
                    <>
                      <span className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                      Signing Up...
                    </>
                  ) : (
                    "Sign Up"
                  )}

                </button>

              </>

            )}


          </div>

        )}

      </div>

      {Response.status && (
        Response.status === "Success"
          ? <SuccessMessage Message={Response.message} />
          : <FailedMessage Message={Response.message} />
      )}

    </section>
  );
}

export default Login;








