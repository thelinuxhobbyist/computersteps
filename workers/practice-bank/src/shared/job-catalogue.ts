import { toVacancy, type Vacancy } from "./jobs";
import { VACANCY_INPUTS } from "./vacancies";

export const VACANCIES: Vacancy[] = VACANCY_INPUTS.map(toVacancy);

const byId = new Map(VACANCIES.map((job) => [job.id, job]));

export function findVacancy(id: string): Vacancy | undefined {
  return byId.get(id.trim().toLowerCase());
}
