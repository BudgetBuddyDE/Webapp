export type SignInProps = { email: string; password: string };

export type SignUpProps = {
  email: string;
  password: string;
  metadata: {
    username: string;
    avatar: string | null;
  };
};
