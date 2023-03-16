import React, { useState, useEffect, useContext, useCallback } from "react";
import { login } from "../../../store/actions/auth";
import { useDispatch, useSelector } from "react-redux";
import { useNavigate, Link } from "react-router-dom";
import AuthLayout from "../../Layout/AuthLayout";
import {
  EMAIL_NOT_VERIFIED,
  INVALID_CREDENTIALS,
  SUCCESSFUL_LOGIN,
  PASSWORD_MIN_CHARACTERS,
  EMAIL_INVALID,
} from "../constants";
import FlashMessageContext from "../../../context/FlashMessage/flashMessageContext";
import isEmailValid from "../validators/emailValidator";
import isPasswordValid from "../validators/passwordValidator";
import "./../Auth.scss";

const Login = () => {
  let navigate = useNavigate();
  const dispatch = useDispatch();
  const flashMessageContext = useContext(FlashMessageContext);

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [isDisabled, setDisabled] = useState(false);
  const isVerified = useSelector((state) => {
    return state.authReducer.isVerified;
  });

  const handleValidInput = (action, value) => {
    switch (action) {
      case "email": {
        setEmail(value);
        break;
      }
      case "password": {
        setPassword(value);
        break;
      }
      default: {
        console.log("Invalid value for validation type");
      }
    }

    flashMessageContext.close();
    setError(null);
    setDisabled(false);
  };

  const handleInvalidInput = (error) => {
    flashMessageContext.error(error);
    setError(error);
    setDisabled(true);
  };

  const onEmailChange = (e) => {
    const value = e.target.value;
    const validEmail = isEmailValid(value);
    if (validEmail) {
      handleValidInput("email", value);
      return;
    }
    handleInvalidInput(EMAIL_INVALID);
  };

  const onPasswordChange = (e) => {
    const value = e.target.value;
    const validPassword = isPasswordValid(value);
    if (validPassword) {
      handleValidInput("password", value);
      return;
    }
    handleInvalidInput(PASSWORD_MIN_CHARACTERS);
  };

  const submitData = async () => {
    try {
      await dispatch(login({ email, password }));
      navigate("/");
      flashMessageContext.success(SUCCESSFUL_LOGIN);
    } catch (e) {
      if (e.status === 404) {
        flashMessageContext.error(INVALID_CREDENTIALS);
        return;
      }
    }
  };

  const onFormSubmit = (e) => {
    e.preventDefault();
    const formHasError = error;
    const isFormValid = !formHasError || formHasError === "";
    if (isFormValid) {
      submitData();
    }
  };

  const isUserVerified = () => {
    if (isVerified === "initial") {
      return;
    }

    if (isVerified) {
      return;
    }

    if (!isVerified) {
      flashMessageContext.error(EMAIL_NOT_VERIFIED);
      return;
    }
  };

  useEffect(() => {
    isUserVerified();
  }, []);

  return (
    <AuthLayout>
      <form onSubmit={onFormSubmit} className="form-auth">
        <h3 className="form-heading">Ulogiraj se!</h3>
        <input
          onChange={onEmailChange}
          required
          type="email"
          placeholder="Email"
        />
        <input
          onChange={onPasswordChange}
          required
          type="password"
          placeholder="Lozinka"
        />
        <button disabled={isDisabled}>Login</button>
      </form>

      <div className="links-auth">
        <Link to="/register">Registriraj se</Link> {"  "}
        <Link to="/forgot-password">Zaboravljena lozinka?</Link>
      </div>
    </AuthLayout>
  );
};

export default Login;
