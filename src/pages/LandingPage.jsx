import {Button} from "@mantine/core";
import {useNavigate} from "react-router-dom";

function LandingPage() {
    const navigate = useNavigate();
    return (
        <>
            <Button onClick={() => {
                navigate("/login")
            }}>Navigate to Login</Button>
        </>
    )
}

export default LandingPage