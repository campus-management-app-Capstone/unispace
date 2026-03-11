'use client';

import React, { useState } from 'react';
import CreateNewClass from './CreateNewClass';

/**
 * CreateNewClassButton renders the primary "Create New Class" trigger button and
 * shows the create-class form inside a modal when activated by an admin.
 */
interface CreateNewClassButtonProps {
  lecturers: { LecturerID: string; LecturerCode: string }[];
  subjects: { SubjectID: string; Name: string }[];
  createAction: (formData: FormData) => Promise<void>;
}

const CreateNewClassButton: React.FC<CreateNewClassButtonProps> = ({
  lecturers,
  subjects,
  createAction,
}) => {
  const [isOpen, setIsOpen] = useState(false);

  function handleClose() {
    setIsOpen(false);
  }

  return (
    <>
      <button
        type="button"
        onClick={() => setIsOpen(true)}
        className="inline-flex h-9 items-center rounded-md bg-black px-4 text-sm font-medium text-white hover:bg-gray-900"
      >
        Create New Class
      </button>

      {isOpen && (
        <div className="fixed inset-0 z-40 flex items-center justify-center bg-black/40 px-4">
          <div className="max-h-[90vh] w-full max-w-xl overflow-y-auto rounded-lg bg-white p-4 shadow-xl">
            <div className="mb-3 flex items-center justify-between gap-3">
              <h2 className="text-lg font-semibold">Create New Class</h2>
              <button
                type="button"
                onClick={handleClose}
                className="text-sm font-medium text-gray-500 hover:text-gray-800"
              >
                Close
              </button>
            </div>

            <CreateNewClass
              lecturers={lecturers}
              subjects={subjects}
              createAction={async (formData) => {
                await createAction(formData);
                handleClose();
              }}
            />
          </div>
        </div>
      )}
    </>
  );
};

export default CreateNewClassButton;

