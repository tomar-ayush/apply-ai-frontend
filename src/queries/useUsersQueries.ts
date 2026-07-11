import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { usersService } from "@/services/usersService";
import { resumeService } from "@/services/resumeService";
import { queryKeys } from "@/queries/queryKeys";
import { ResumeVersion } from "@/types/enums";
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
    queryKey: queryKeys.resumeVersion(ResumeVersion.ORIGINAL),
    queryFn: () => resumeService.getDownloadUrl(ResumeVersion.ORIGINAL),
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
