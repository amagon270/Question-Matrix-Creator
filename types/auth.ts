declare namespace auth {
  type DecodedAuthToken = {
    userId: number;
    username: string;
    exp: number;
  };
};