import * as React from 'react';

import { Html, Button, Head, Container, Img } from "@react-email/components";
interface EmailProps {
    emailVerificationUrl: string
}
const SignUpEmail: React.FC<EmailProps> = (props) => {
    const { emailVerificationUrl } = props;
    return (
        <Html lang="en">
            <Head>
                <title> Maity Pro | Sign Up 🚀</title>
            </Head>
            <Container>
                <h1 style={{ color: "black" }}>Welcome to Maity Pro</h1>
                <p style={{ color: "black" }}>Please verify your email by clicking the link below.</p>
                <Button href={emailVerificationUrl} style={{ color: "black" }}>Verify Email</Button>
            </Container>
        </Html>
    );
}
export default SignUpEmail
