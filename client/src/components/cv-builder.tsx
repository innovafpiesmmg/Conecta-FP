import { useState, useEffect } from "react";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { apiRequest } from "@/lib/queryClient";
import type { CvData, CvEducation, CvExperience, CvLanguage } from "@shared/schema";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Switch } from "@/components/ui/switch";
import { Badge } from "@/components/ui/badge";
import { useToast } from "@/hooks/use-toast";
import {
  GraduationCap, Briefcase, Languages, Plus, Trash2, Save, Loader2, FileText, Info
} from "lucide-react";

const LANGUAGE_LEVELS = [
  "A1 - Principiante",
  "A2 - Elemental",
  "B1 - Intermedio",
  "B2 - Intermedio alto",
  "C1 - Avanzado",
  "C2 - Nativo/Bilingüe",
];

function emptyEducation(): CvEducation {
  return { institution: "", title: "", startYear: new Date().getFullYear(), endYear: undefined, description: "" };
}
function emptyExperience(): CvExperience {
  return { company: "", position: "", startDate: "", endDate: "", current: false, description: "" };
}
function emptyLanguage(): CvLanguage {
  return { language: "", level: LANGUAGE_LEVELS[0] };
}

interface CvBuilderProps {
  readOnly?: boolean;
  alumniId?: string;
}

export function CvBuilder({ readOnly = false, alumniId }: CvBuilderProps) {
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const endpoint = alumniId ? `/api/cv/${alumniId}` : "/api/cv";

  const { data, isLoading } = useQuery<{ cvData: CvData | null; cvLastUpdatedAt: string | null }>({
    queryKey: [endpoint],
  });

  const [education, setEducation] = useState<CvEducation[]>([]);
  const [experience, setExperience] = useState<CvExperience[]>([]);
  const [languages, setLanguages] = useState<CvLanguage[]>([]);
  const [additionalInfo, setAdditionalInfo] = useState("");

  useEffect(() => {
    if (data?.cvData) {
      setEducation(data.cvData.education || []);
      setExperience(data.cvData.experience || []);
      setLanguages(data.cvData.languages || []);
      setAdditionalInfo(data.cvData.additionalInfo || "");
    }
  }, [data]);

  const saveMutation = useMutation({
    mutationFn: async (cvData: CvData) => {
      const res = await apiRequest("PUT", "/api/cv", cvData);
      return res.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/cv"] });
      queryClient.invalidateQueries({ queryKey: ["/api/auth/me"] });
      toast({ title: "CV guardado correctamente" });
    },
    onError: () => {
      toast({ title: "Error al guardar el CV", variant: "destructive" });
    },
  });

  const handleSave = () => {
    saveMutation.mutate({ education, experience, languages, additionalInfo });
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center py-12">
        <Loader2 className="w-6 h-6 animate-spin text-muted-foreground" />
      </div>
    );
  }

  const hasContent = education.length > 0 || experience.length > 0 || languages.length > 0 || additionalInfo;

  if (readOnly && !hasContent) {
    return (
      <div className="flex flex-col items-center justify-center py-8 text-muted-foreground gap-2">
        <FileText className="w-8 h-8" />
        <p>Este candidato aún no ha creado su CV dinámico.</p>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {data?.cvLastUpdatedAt && (
        <div className="flex items-center gap-2 text-sm text-muted-foreground">
          <Info className="w-4 h-4" />
          <span>Última actualización: {new Date(data.cvLastUpdatedAt).toLocaleDateString("es-ES", { day: "numeric", month: "long", year: "numeric" })}</span>
        </div>
      )}

      <Card className="p-4 sm:p-6 space-y-4">
        <div className="flex items-center gap-2">
          <GraduationCap className="w-5 h-5 text-primary" />
          <h3 className="font-semibold text-lg">Formación</h3>
          {!readOnly && (
            <Button
              size="sm"
              variant="outline"
              className="ml-auto"
              onClick={() => setEducation([...education, emptyEducation()])}
              data-testid="button-add-education"
            >
              <Plus className="w-4 h-4 mr-1" /> Añadir
            </Button>
          )}
        </div>

        {education.length === 0 && (
          <p className="text-sm text-muted-foreground">No hay formación añadida.</p>
        )}

        {education.map((edu, idx) => (
          <div key={idx} className="border rounded-md p-4 space-y-3 relative">
            {!readOnly && (
              <Button
                size="icon"
                variant="ghost"
                className="absolute top-2 right-2"
                onClick={() => setEducation(education.filter((_, i) => i !== idx))}
                data-testid={`button-remove-education-${idx}`}
              >
                <Trash2 className="w-4 h-4 text-destructive" />
              </Button>
            )}
            {readOnly ? (
              <div>
                <p className="font-medium">{edu.title}</p>
                <p className="text-sm text-muted-foreground">{edu.institution}</p>
                <p className="text-sm text-muted-foreground">{edu.startYear}{edu.endYear ? ` - ${edu.endYear}` : " - Actualidad"}</p>
                {edu.description && <p className="text-sm mt-1">{edu.description}</p>}
              </div>
            ) : (
              <>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <div>
                    <Label>Título / Ciclo</Label>
                    <Input
                      value={edu.title}
                      onChange={e => {
                        const updated = [...education];
                        updated[idx] = { ...edu, title: e.target.value };
                        setEducation(updated);
                      }}
                      placeholder="CFGS Desarrollo de Aplicaciones Web"
                      data-testid={`input-education-title-${idx}`}
                    />
                  </div>
                  <div>
                    <Label>Centro</Label>
                    <Input
                      value={edu.institution}
                      onChange={e => {
                        const updated = [...education];
                        updated[idx] = { ...edu, institution: e.target.value };
                        setEducation(updated);
                      }}
                      placeholder="IES Nombre del Centro"
                      data-testid={`input-education-institution-${idx}`}
                    />
                  </div>
                </div>
                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <Label>Año inicio</Label>
                    <Input
                      type="number"
                      value={edu.startYear}
                      onChange={e => {
                        const updated = [...education];
                        updated[idx] = { ...edu, startYear: parseInt(e.target.value) || 0 };
                        setEducation(updated);
                      }}
                      data-testid={`input-education-startyear-${idx}`}
                    />
                  </div>
                  <div>
                    <Label>Año fin (vacío si actual)</Label>
                    <Input
                      type="number"
                      value={edu.endYear || ""}
                      onChange={e => {
                        const updated = [...education];
                        updated[idx] = { ...edu, endYear: e.target.value ? parseInt(e.target.value) : undefined };
                        setEducation(updated);
                      }}
                      data-testid={`input-education-endyear-${idx}`}
                    />
                  </div>
                </div>
                <div>
                  <Label>Descripción (opcional)</Label>
                  <Textarea
                    value={edu.description || ""}
                    onChange={e => {
                      const updated = [...education];
                      updated[idx] = { ...edu, description: e.target.value };
                      setEducation(updated);
                    }}
                    placeholder="Descripción de la formación..."
                    rows={2}
                    data-testid={`textarea-education-desc-${idx}`}
                  />
                </div>
              </>
            )}
          </div>
        ))}
      </Card>

      <Card className="p-4 sm:p-6 space-y-4">
        <div className="flex items-center gap-2">
          <Briefcase className="w-5 h-5 text-primary" />
          <h3 className="font-semibold text-lg">Experiencia profesional</h3>
          {!readOnly && (
            <Button
              size="sm"
              variant="outline"
              className="ml-auto"
              onClick={() => setExperience([...experience, emptyExperience()])}
              data-testid="button-add-experience"
            >
              <Plus className="w-4 h-4 mr-1" /> Añadir
            </Button>
          )}
        </div>

        {experience.length === 0 && (
          <p className="text-sm text-muted-foreground">No hay experiencia añadida.</p>
        )}

        {experience.map((exp, idx) => (
          <div key={idx} className="border rounded-md p-4 space-y-3 relative">
            {!readOnly && (
              <Button
                size="icon"
                variant="ghost"
                className="absolute top-2 right-2"
                onClick={() => setExperience(experience.filter((_, i) => i !== idx))}
                data-testid={`button-remove-experience-${idx}`}
              >
                <Trash2 className="w-4 h-4 text-destructive" />
              </Button>
            )}
            {readOnly ? (
              <div>
                <p className="font-medium">{exp.position}</p>
                <p className="text-sm text-muted-foreground">{exp.company}</p>
                <p className="text-sm text-muted-foreground">{exp.startDate}{exp.current ? " - Actualidad" : exp.endDate ? ` - ${exp.endDate}` : ""}</p>
                {exp.description && <p className="text-sm mt-1">{exp.description}</p>}
              </div>
            ) : (
              <>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <div>
                    <Label>Puesto</Label>
                    <Input
                      value={exp.position}
                      onChange={e => {
                        const updated = [...experience];
                        updated[idx] = { ...exp, position: e.target.value };
                        setExperience(updated);
                      }}
                      placeholder="Desarrollador Web Junior"
                      data-testid={`input-experience-position-${idx}`}
                    />
                  </div>
                  <div>
                    <Label>Empresa</Label>
                    <Input
                      value={exp.company}
                      onChange={e => {
                        const updated = [...experience];
                        updated[idx] = { ...exp, company: e.target.value };
                        setExperience(updated);
                      }}
                      placeholder="Nombre de la empresa"
                      data-testid={`input-experience-company-${idx}`}
                    />
                  </div>
                </div>
                <div className="grid grid-cols-2 gap-3 items-end">
                  <div>
                    <Label>Fecha inicio</Label>
                    <Input
                      type="month"
                      value={exp.startDate}
                      onChange={e => {
                        const updated = [...experience];
                        updated[idx] = { ...exp, startDate: e.target.value };
                        setExperience(updated);
                      }}
                      data-testid={`input-experience-startdate-${idx}`}
                    />
                  </div>
                  <div>
                    <Label>Fecha fin</Label>
                    <Input
                      type="month"
                      value={exp.endDate || ""}
                      onChange={e => {
                        const updated = [...experience];
                        updated[idx] = { ...exp, endDate: e.target.value };
                        setExperience(updated);
                      }}
                      disabled={exp.current}
                      data-testid={`input-experience-enddate-${idx}`}
                    />
                  </div>
                </div>
                <div className="flex items-center gap-2">
                  <Switch
                    checked={exp.current || false}
                    onCheckedChange={checked => {
                      const updated = [...experience];
                      updated[idx] = { ...exp, current: checked, endDate: checked ? "" : exp.endDate };
                      setExperience(updated);
                    }}
                    data-testid={`switch-experience-current-${idx}`}
                  />
                  <Label className="text-sm">Trabajo actual</Label>
                </div>
                <div>
                  <Label>Descripción (opcional)</Label>
                  <Textarea
                    value={exp.description || ""}
                    onChange={e => {
                      const updated = [...experience];
                      updated[idx] = { ...exp, description: e.target.value };
                      setExperience(updated);
                    }}
                    placeholder="Describe tus responsabilidades..."
                    rows={2}
                    data-testid={`textarea-experience-desc-${idx}`}
                  />
                </div>
              </>
            )}
          </div>
        ))}
      </Card>

      <Card className="p-4 sm:p-6 space-y-4">
        <div className="flex items-center gap-2">
          <Languages className="w-5 h-5 text-primary" />
          <h3 className="font-semibold text-lg">Idiomas</h3>
          {!readOnly && (
            <Button
              size="sm"
              variant="outline"
              className="ml-auto"
              onClick={() => setLanguages([...languages, emptyLanguage()])}
              data-testid="button-add-language"
            >
              <Plus className="w-4 h-4 mr-1" /> Añadir
            </Button>
          )}
        </div>

        {languages.length === 0 && (
          <p className="text-sm text-muted-foreground">No hay idiomas añadidos.</p>
        )}

        <div className="space-y-2">
          {languages.map((lang, idx) => (
            <div key={idx} className="flex items-center gap-3 flex-wrap">
              {readOnly ? (
                <div className="flex items-center gap-2">
                  <Badge variant="secondary">{lang.language}</Badge>
                  <span className="text-sm text-muted-foreground">{lang.level}</span>
                </div>
              ) : (
                <>
                  <Input
                    value={lang.language}
                    onChange={e => {
                      const updated = [...languages];
                      updated[idx] = { ...lang, language: e.target.value };
                      setLanguages(updated);
                    }}
                    placeholder="Inglés"
                    className="flex-1 min-w-[120px] max-w-[200px]"
                    data-testid={`input-language-name-${idx}`}
                  />
                  <Select
                    value={lang.level}
                    onValueChange={val => {
                      const updated = [...languages];
                      updated[idx] = { ...lang, level: val };
                      setLanguages(updated);
                    }}
                  >
                    <SelectTrigger className="flex-1 min-w-[180px] max-w-[250px]" data-testid={`select-language-level-${idx}`}>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      {LANGUAGE_LEVELS.map(l => (
                        <SelectItem key={l} value={l}>{l}</SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                  <Button
                    size="icon"
                    variant="ghost"
                    onClick={() => setLanguages(languages.filter((_, i) => i !== idx))}
                    data-testid={`button-remove-language-${idx}`}
                  >
                    <Trash2 className="w-4 h-4 text-destructive" />
                  </Button>
                </>
              )}
            </div>
          ))}
        </div>
      </Card>

      <Card className="p-4 sm:p-6 space-y-4">
        <div className="flex items-center gap-2">
          <Info className="w-5 h-5 text-primary" />
          <h3 className="font-semibold text-lg">Información adicional</h3>
        </div>
        {readOnly ? (
          additionalInfo ? (
            <p className="text-sm whitespace-pre-wrap">{additionalInfo}</p>
          ) : (
            <p className="text-sm text-muted-foreground">Sin información adicional.</p>
          )
        ) : (
          <Textarea
            value={additionalInfo}
            onChange={e => setAdditionalInfo(e.target.value)}
            placeholder="Certificaciones, proyectos personales, voluntariado, carnet de conducir..."
            rows={4}
            data-testid="textarea-additional-info"
          />
        )}
      </Card>

      {!readOnly && (
        <div className="flex justify-end">
          <Button
            onClick={handleSave}
            disabled={saveMutation.isPending}
            data-testid="button-save-cv"
          >
            {saveMutation.isPending ? <Loader2 className="w-4 h-4 animate-spin mr-2" /> : <Save className="w-4 h-4 mr-2" />}
            Guardar CV
          </Button>
        </div>
      )}
    </div>
  );
}
