import React, { useState } from "react";
import { register } from "../../../store/actions/auth";
import { useDispatch } from "react-redux";
import { useNavigate, Link } from "react-router-dom";

import AuthLayout from "../../Layout/AuthLayout";
import "./../Auth.scss";
import isEmailValid from "../validators/emailValidator";
import isPasswordValid from "../validators/passwordValidator";
import {
  EMAIL_INVALID,
  NAME_EMPTY,
  LAST_NAME_EMPTY,
  PASSWORD_MIN_CHARACTERS,
} from "../constants/login";
import ErrorMessage from "../../Error";
import nameValidator from "../validators/nameValidator";
import optionValidator from "../validators/optionValidator";
const Register = () => {
  let navigate = useNavigate();
  const dispatch = useDispatch();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [firstName, setFirstName] = useState("");
  const [lastName, setLastName] = useState("");
  const [gender, setGender] = useState("female");
  const [error, setError] = useState("");
  const [isDisabled, setDisabled] = useState(false);

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
      case "firstName": {
        setFirstName(value);
        break;
      }
      case "lastName": {
        setLastName(value);
        break;
      }

      case "gender": {
        setGender(value);
        break;
      }
      default: {
        console.log("Invalid value for validation type");
      }
    }

    setError(null);
    setDisabled(false);
  };
  const handleInvalidInput = (error) => {
    setError(error);
    setDisabled(true);
  };
  const onNameChange = (e) => {
    const value = e.target.value;
    const validName = nameValidator(value);
    if (validName) {
      handleValidInput("firstName", value);
      return;
    }
    handleInvalidInput(NAME_EMPTY);
  };
  const onLastNameChange = (e) => {
    const value = e.target.value;
    const validLastName = nameValidator(value);
    if (validLastName) {
      handleValidInput("lastName", value);
      return;
    }
    handleInvalidInput(LAST_NAME_EMPTY);
  };
  const onGenderSelect = (e) => {
    const value = e.target.value;
    const gender = optionValidator(value);
    if (gender) {
      handleValidInput("gender", value);
    }
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

  const onSubmit = (e) => {
    e.preventDefault();
    dispatch(
      register({ email, password, firstName, lastName, gender }, navigate)
    );
  };
  return (
    <AuthLayout>
      <form onSubmit={onSubmit} className="form-auth">
        <h2 className="form-heading">Pridruži se</h2>
        <input
          onChange={onNameChange}
          required
          type="text"
          placeholder="Tvoje ime"
        />

        <input
          onChange={onLastNameChange}
          required
          type="text"
          placeholder="Tvoje prezime"
        />

        <select onChange={onGenderSelect}>
          <option value="male">Male</option>
          <option value="female">Female</option>
        </select>

        <input
          onChange={onEmailChange}
          required
          type="email"
          placeholder="Tvoj mail"
        />

        <input
          onChange={onPasswordChange}
          required
          type="password"
          placeholder="Tvoja lozinka"
        />

        <button disabled={isDisabled}>Pridruži se</button>
      </form>
      <ErrorMessage error={error} />
      <div className="links-auth">
        <Link to="/login">Ulogiraj se</Link>
      </div>
    </AuthLayout>
  );
};

export default Register;
