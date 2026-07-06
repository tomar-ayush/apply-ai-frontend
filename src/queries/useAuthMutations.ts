import { useMutation } from "@tanstack/react-query";
import { authService, type LoginPayload, type RegisterPayload } from "@/services/authService";

export function useLogin() {
  return useMutation({
    mutationFn: (payload: LoginPayload) => authService.login(payload),
  });
}

export function useRegister() {
  return useMutation({
    mutationFn: (payload: RegisterPayload) => authService.register(payload),
  });
}
