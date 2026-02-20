import { useQuery } from "@tanstack/react-query";

type FamiliaProfesional = {
  id: string;
  name: string;
  active: boolean;
};

type CicloFormativo = {
  id: string;
  name: string;
  familiaId: string;
  active: boolean;
};

type FpCenter = {
  id: string;
  name: string;
  municipio: string;
  isla: string;
  active: boolean;
};

export function useFamilias() {
  return useQuery<FamiliaProfesional[]>({
    queryKey: ["/api/public/familias"],
    staleTime: 5 * 60 * 1000,
  });
}

export function useCiclosByFamiliaName(familiaName: string | undefined) {
  const { data: familias } = useFamilias();
  const familia = familias?.find(f => f.name === familiaName);
  const familiaId = familia?.id;

  return useQuery<CicloFormativo[]>({
    queryKey: ["/api/public/ciclos", familiaId],
    enabled: !!familiaId,
    staleTime: 5 * 60 * 1000,
  });
}

export function useFpCenters() {
  return useQuery<FpCenter[]>({
    queryKey: ["/api/public/fp-centers"],
    staleTime: 5 * 60 * 1000,
  });
}
