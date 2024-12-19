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
            <Container style={{
                maxWidth: "600px",
                margin: "0 auto",
                padding: "40px 20px",
                fontFamily: "-apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif"
            }}>
                <h1 style={{
                    color: "#2d3748",
                    fontSize: "24px",
                    marginBottom: "24px",
                    textAlign: "center"
                }}>Welcome Onboard 🚀</h1>

                <p style={{
                    color: "#4a5568",
                    fontSize: "16px",
                    lineHeight: "1.6",
                    marginBottom: "32px",
                    textAlign: "center"
                }}>Please verify your email by clicking the button below.</p>

                <div style={{ textAlign: "center" }}>
                    <a
                        href={emailVerificationUrl}
                        style={{
                            backgroundColor: "#e87223",
                            color: "white",
                            padding: "12px 24px",
                            borderRadius: "6px",
                            textDecoration: "none",
                            fontWeight: "500",
                            display: "inline-block",
                            textAlign: "center",
                            transition: "background-color 0.2s"
                        }}
                    >
                        Verify Email
                    </a>
                </div>
            </Container>
        </Html>
    );
}
export default SignUpEmail
