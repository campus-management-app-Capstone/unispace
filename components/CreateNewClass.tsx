import React from 'react';

/**
 * CreateNewClass renders a compact form for creating a new class.
 * It is designed for admin usage inside the class repository page.
 */
interface CreateNewClassProps {
  lecturers: { LecturerID: string; LecturerCode: string }[];
  subjects: { SubjectID: string; Name: string }[];
  createAction: (formData: FormData) => Promise<void>;
}

const CreateNewClass: React.FC<CreateNewClassProps> = ({
  lecturers,
  subjects,
  createAction,
}) => {
  return (
    <form
      action={createAction}
      className="flex flex-col gap-4 rounded-lg border border-gray-200 bg-white p-4 shadow-sm"
    >
      <h2 className="text-lg font-semibold">Create New Class</h2>

      <div className="grid gap-4 sm:grid-cols-2">
        <div className="flex flex-col gap-1">
          <label htmlFor="ClassID" className="text-sm font-medium text-gray-700">
            Class ID
          </label>
          <input
            id="ClassID"
            name="ClassID"
            required
            className="h-9 rounded-md border border-gray-300 px-3 text-sm focus:border-black focus:outline-none"
            placeholder="e.g. CS01-03A1-DTIN-C1"
          />
        </div>

        <div className="flex flex-col gap-1">
          <label htmlFor="Group" className="text-sm font-medium text-gray-700">
            Group
          </label>
          <input
            id="Group"
            name="Group"
            required
            className="h-9 rounded-md border border-gray-300 px-3 text-sm focus:border-black focus:outline-none"
            placeholder="e.g. Section A"
          />
        </div>

        <div className="flex flex-col gap-1">
          <label
            htmlFor="SubjectID"
            className="text-sm font-medium text-gray-700"
          >
            Subject
          </label>
          <select
            id="SubjectID"
            name="SubjectID"
            required
            className="h-9 rounded-md border border-gray-300 px-3 text-sm focus:border-black focus:outline-none"
            defaultValue=""
          >
            <option value="" disabled>
              Select subject
            </option>
            {subjects.map((subject) => (
              <option key={subject.SubjectID} value={subject.SubjectID}>
                {subject.SubjectID} — {subject.Name}
              </option>
            ))}
          </select>
        </div>

        <div className="flex flex-col gap-1">
          <label
            htmlFor="LecturerID"
            className="text-sm font-medium text-gray-700"
          >
            Lecturer
          </label>
          <select
            id="LecturerID"
            name="LecturerID"
            required
            className="h-9 rounded-md border border-gray-300 px-3 text-sm focus:border-black focus:outline-none"
            defaultValue=""
          >
            <option value="" disabled>
              Select lecturer
            </option>
            {lecturers.map((lecturer) => (
              <option key={lecturer.LecturerID} value={lecturer.LecturerID}>
                {lecturer.LecturerCode || lecturer.LecturerID}
              </option>
            ))}
          </select>
        </div>

        <div className="flex flex-col gap-1">
          <label htmlFor="Type" className="text-sm font-medium text-gray-700">
            Type
          </label>
          <select
            id="Type"
            name="Type"
            required
            className="h-9 rounded-md border border-gray-300 px-3 text-sm focus:border-black focus:outline-none"
            defaultValue="Lecture"
          >
            <option value="Lecture">Lecture</option>
            <option value="Tutorial">Tutorial</option>
            <option value="Lab">Lab</option>
          </select>
        </div>
      </div>

      <div className="flex justify-end gap-3">
        <button
          type="submit"
          className="inline-flex h-9 items-center rounded-md bg-black px-4 text-sm font-medium text-white hover:bg-gray-900"
        >
          Create Class
        </button>
      </div>
    </form>
  );
};

export default CreateNewClass;