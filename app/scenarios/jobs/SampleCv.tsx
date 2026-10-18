import type { CvJob } from "../../../workers/practice-bank/src/shared/job-application";
import {
  PRACTICE_EMPLOYMENT,
  SAVED_CV_QUALIFICATIONS,
  SAVED_CV_SKILLS,
  SAVED_CV_STATEMENT,
  type PracticeProfile,
} from "../../../workers/practice-bank/src/shared/practice-profile";

export type SampleCvContent = {
  jobs: CvJob[];
  dutyItems: string[];
  skillItems: string[];
  qualificationItems: string[];
  statement?: string;
};

function skillLines(skills: string): string[] {
  return skills
    .split(/(?<=\.)\s+/)
    .map((item) => item.replace(/\.$/, "").trim())
    .filter(Boolean);
}

function ended(dateTo: string): string {
  return dateTo === "Still in this job" ? "Present" : dateTo;
}

export function SampleCv({ profile, cv }: { profile: PracticeProfile; cv?: SampleCvContent }) {
  const jobs = cv?.jobs?.length
    ? cv.jobs
    : [
        {
          jobTitle: PRACTICE_EMPLOYMENT.jobTitle,
          employerName: PRACTICE_EMPLOYMENT.employerName,
          dateFrom: PRACTICE_EMPLOYMENT.dateFrom,
          dateTo: PRACTICE_EMPLOYMENT.dateTo,
        },
      ];
  const duties = (cv ? cv.dutyItems : [PRACTICE_EMPLOYMENT.duties]).map((item) => item.trim()).filter(Boolean);
  const skills = (cv ? cv.skillItems : skillLines(SAVED_CV_SKILLS)).map((item) => item.replace(/\.$/, "").trim()).filter(Boolean);
  const qualifications = (cv ? cv.qualificationItems : [SAVED_CV_QUALIFICATIONS]).map((item) => item.trim()).filter(Boolean);
  const statement = cv?.statement?.trim() || SAVED_CV_STATEMENT;

  return (
    <article className="wj-cv-sheet" aria-label={`CV for ${profile.fullName}`}>
      <header className="wj-cv-sheet__head">
        <p className="wj-cv-sheet__name">{profile.fullName}</p>
        <p className="wj-cv-sheet__contact">
          <span>{profile.addressLine}</span>
          <span>{profile.town}</span>
          <span>{profile.postcode}</span>
        </p>
        <p className="wj-cv-sheet__contact">
          <span>{profile.telephone}</span>
          <span>{profile.email}</span>
        </p>
      </header>

      <section>
        <h3>Profile</h3>
        <p>{statement}</p>
      </section>

      <section>
        <h3>Employment</h3>
        {jobs.map((job, index) => (
          <div className="wj-cv-role" key={`${index}-${job.jobTitle}`}>
            <div className="wj-cv-role__top">
              <strong>{job.jobTitle}</strong>
              <span>
                {job.dateFrom} – {ended(job.dateTo)}
              </span>
            </div>
            <p className="wj-cv-role__where">{job.employerName}</p>
          </div>
        ))}
        {duties.length > 0 ? (
          <ul>
            {duties.map((duty, index) => (
              <li key={`${index}-${duty}`}>{duty}</li>
            ))}
          </ul>
        ) : null}
      </section>

      <section>
        <h3>Skills</h3>
        <ul>
          {skills.map((skill, index) => (
            <li key={`${index}-${skill}`}>{skill}</li>
          ))}
        </ul>
      </section>

      <section>
        <h3>Education and training</h3>
        {qualifications.length > 1 ? (
          <ul>
            {qualifications.map((item, index) => (
              <li key={`${index}-${item}`}>{item}</li>
            ))}
          </ul>
        ) : (
          <p>{qualifications[0] ?? ""}</p>
        )}
      </section>

      <p className="wj-cv-sheet__note">Practice CV. These details are fictional and are not sent to an employer.</p>
    </article>
  );
}
