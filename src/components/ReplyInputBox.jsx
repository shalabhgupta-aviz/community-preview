'use client';

import AlertBox from '@/components/AlertBox';
import SimpleRichTextEditor from '@/plugins/SimpleRichTextEditor';

export default function ReplyInputBox({
  title,
  setTitle,
  titleRequired = false,
  replyContent,
  setReplyContent,
  onSubmit,
  onSaveDraft,
  isSubmitting,
  draftReplies,
  error,
  draftError,
  onErrorClose,
  onDraftErrorClose,
  type,
}) {
  const handleSubmit = (e) => {
    e.preventDefault();
    onSubmit();
  };

  const handleSave = () => {
    onSaveDraft();
  };

  return (
    <div className="mt-2 p-4 bg-white rounded-lg">
      {/* Global submission error */}
      {error && (
        <AlertBox
          message={error}
          type="error"
          onClose={onErrorClose}
          className="mb-4"
        />
      )}
      {/* Draft-specific error */}
      {draftError && (
        <AlertBox
          message={draftError}
          type="error"
          onClose={onDraftErrorClose}
          className="mb-4"
        />
      )}

      <form onSubmit={handleSubmit}>
        {titleRequired && (
          <div className="mb-4">
            <input
              type="text"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              placeholder="Enter title"
              className="w-full p-2 border border-gray-300 rounded"
              required
            />
          </div>
        )}
        <div className="editor-wrapper">
          <SimpleRichTextEditor
            initialHtml={replyContent}
            onChange={setReplyContent}
          />
        </div>
        <div className="flex justify-end space-x-2">
          <button
            type="button"
            onClick={handleSave}
            className={`px-4 py-2 rounded-full mt-4 font-bold text-white
              ${draftReplies.length >= 3
                ? 'bg-gray-300 cursor-not-allowed'
                : 'bg-gray-500 hover:bg-gray-700'
              }`}
          >
            Save Draft
          </button>
          <button
            type="submit"
            disabled={isSubmitting}
            className={`bg-[#191153] text-white px-4 py-2 rounded-full mt-4 font-bold ${
              isSubmitting ? 'opacity-50 cursor-not-allowed' : 'hover:bg-[#2a1c7a]'
            }`}
          >
            {isSubmitting ? 'Submitting...' : type === 'question' ? 'Submit Question' : 'Submit Reply'}
          </button>
        </div>
      </form>
    </div>
  );
}
