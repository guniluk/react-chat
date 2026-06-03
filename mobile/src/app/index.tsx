import { Redirect } from "expo-router";
import { useAuthStore } from "../store/useAuthStore";

export default function Index() {
  const { authUser } = useAuthStore();

  if (authUser) {
    return <Redirect href="/home" />;
  }

  return <Redirect href="/login" />;
}
