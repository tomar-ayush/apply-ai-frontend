import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { usersService } from "@/services/usersService";
import { queryKeys } from "@/queries/queryKeys";
import type { UpdateUserRequest } from "@/types/api";

export function useMe(enabled = true) {
  return useQuery({
    queryKey: queryKeys.me,
    queryFn: () => usersService.getMe(),
    enabled,
  });
}

export function useOriginalResume(enabled = true) {
  return useQuery({
    queryKey: queryKeys.resumeOriginal,
    queryFn: () => usersService.getResume(),
    enabled,
  });
}

export function useUpdateProfile() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (payload: UpdateUserRequest) => usersService.updateMe(payload),
    onSuccess: (data) => {
      queryClient.setQueryData(queryKeys.me, data);
    },
  });
}

export function useUploadResume() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (formData: FormData) => usersService.uploadResume(formData),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: queryKeys.resumeOriginal });
      queryClient.invalidateQueries({ queryKey: queryKeys.me });
    },
  });
}
