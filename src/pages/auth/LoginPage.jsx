import {Button, PasswordInput, Stack, TextInput} from "@mantine/core";
import {useNavigate} from "react-router-dom";
import {signInWithEmailAndPassword} from "firebase/auth"
import {useState} from "react";
import {auth} from "../../../firebaseConfig.js";

function LoginPage() {

    const navigate = useNavigate()

    const [email, setEmail] = useState('')
    const [password, setPassword] = useState('')
    const [isLoginInProgress, setIsLoginInProgress] = useState(false)

    const handleEmailChange = (event) => {
        setEmail(event.target.value)
    }

    const handlePasswordChange = (event) => {
        setPassword(event.target.value)
    }

    const handleLoginButton = async () => {
        setIsLoginInProgress(true)
        try {
            await signInWithEmailAndPassword(auth,email,password)
            navigate("/dashboard")
        }
        catch (e) {
            alert(e.message)
        }
        finally {
            setIsLoginInProgress(false)
        }
    }

    const handleRegisterButton = () => {
        navigate("/register")
    }


    return (
        <Stack
            align="strech"
        >
            <TextInput
                label="Sign in"
                placeholder="Email"
                value={email}
                onChange={handleEmailChange}
            />

            <PasswordInput
                placeholder="Password"
                value={password}
                onChange={handlePasswordChange}

            />
            <Button style={{outline: "none", boxShadow: "none"}}
                    variant="transparent"
                    loading={isLoginInProgress}
                    onClick={handleLoginButton}>Sign in</Button>

            <Button style={{outline: "none", boxShadow: "none"}}
                    variant="transparent"
                    onClick={handleRegisterButton}>
                New user? Register now!
            </Button>

        </Stack>
    )
}

export default LoginPage
