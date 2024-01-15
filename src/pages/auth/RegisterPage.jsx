import { Button, PasswordInput, Stack, TextInput } from "@mantine/core";
import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { createUserWithEmailAndPassword } from "firebase/auth";
import { auth } from "../../../firebaseConfig.js";

export function RegisterPage() {
  const [isPasswordVisible, setIsPasswordVisible] = useState(false);
  const [displayName, setDisplayName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [controlPassword, setControlPassword] = useState("");
  const [isRegisterInProgress, setIsRegisterInProgress] = useState(false);

  const navigate = useNavigate();

  const handleDisplayNameChange = (event) => {
    setDisplayName(event.target.value);
  };
  const handleEmailChange = (event) => {
    setEmail(event.target.value);
  };
  const handlePasswordChange = (event) => {
    setPassword(event.target.value);
  };
  const handleControlPasswordChange = (event) => {
    setControlPassword(event.target.value);
  };

  const handleIsPasswordVisibleSwitch = (event) => {
    setIsPasswordVisible(!isPasswordVisible);
  };
  const handleRegisterButton = async (event) => {
    setIsRegisterInProgress(true);
    try {
      createUserWithEmailAndPassword(auth, email, password);
      navigate("/dashboard");
    } catch (e) {
      alert(e.message);
    } finally {
      setIsRegisterInProgress(false);
    }
  };

  return (
    <Stack align="strech">
      <TextInput
        label="Display name"
        value={displayName}
        onChange={handleDisplayNameChange}
        placeholder="Display name"
      />

      <TextInput
        label="email"
        value={email}
        onChange={handleEmailChange}
        placeholder="Email"
      />

      <PasswordInput
        label="Password"
        visible={isPasswordVisible}
        value={password}
        onChange={handlePasswordChange}
        onVisibilityChange={setIsPasswordVisible}
        placeholder="Password"
      />

      <PasswordInput
        label="Confirm password"
        visible={isPasswordVisible}
        value={controlPassword}
        onChange={handleControlPasswordChange}
        onVisibilityChange={handleIsPasswordVisibleSwitch}
        placeholder="Confirm password"
      />

      <Button
        style={{ outline: "none", boxShadow: "none" }}
        variant="transparent"
        loading={isRegisterInProgress}
        onClick={handleRegisterButton}
      >
        Create new account
      </Button>
    </Stack>
  );
}
