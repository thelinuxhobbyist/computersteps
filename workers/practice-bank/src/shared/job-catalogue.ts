import { toVacancy, type Vacancy } from "./jobs";
import { VACANCY_EXPANSION } from "./vacancy-expansion";
import { VACANCY_INPUTS } from "./vacancies";

export const VACANCIES: Vacancy[] = [...VACANCY_INPUTS, ...VACANCY_EXPANSION].map(toVacancy);

const byId = new Map(VACANCIES.map((job) => [job.id, job]));

export function findVacancy(id: string): Vacancy | undefined {
  return byId.get(id.trim().toLowerCase());
}
