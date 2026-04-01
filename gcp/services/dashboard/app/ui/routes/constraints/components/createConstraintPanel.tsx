import { useContext, useState } from "react";
import { useRevalidator } from "react-router";
import { getApiClient } from "~/client/api-client";
import { CurrentConstraintContext } from "~/context/currentConstraintContext";
import { ToastContext } from "~/context/toastContext";
import { extractErrorMessage } from "~/utils/errorMessage";
import { scrollToElement } from "~/utils/scrollTo";

interface FormData {
  description: string;
  key: string;
  commaSeparatedValues: string;
}

interface FormErrors {
  description: string;
  key: string;
  commaSeparatedValues: string;
}

export default function CreateConstraintPanel({
  isOpen,
  onClose,
}: {
  isOpen: boolean;
  onClose: () => void;
}) {
  const [formData, setFormData] = useState<FormData>({
    description: "",
    key: "",
    commaSeparatedValues: "",
  });
  const [errors, setErrors] = useState<FormErrors>({
    description: "",
    key: "",
    commaSeparatedValues: "",
  });
  const [confirming, setConfirming] = useState(false);
  const [loading, setLoading] = useState(false);
  const [submitError, setSubmitError] = useState("");

  const revalidator = useRevalidator();
  const { queueToast } = useContext(ToastContext);
  const { setCurrentConstraint } = useContext(CurrentConstraintContext);

  function validate(): boolean {
    const next: FormErrors = {
      description: "",
      key: "",
      commaSeparatedValues: "",
    };
    let ok = true;
    if (!formData.description.trim()) {
      next.description = "Field is required";
      ok = false;
    }
    if (!formData.key.trim()) {
      next.key = "Field is required";
      ok = false;
    }
    if (!formData.commaSeparatedValues.trim()) {
      next.commaSeparatedValues = "Field is required";
      ok = false;
    }
    setErrors(next);
    return ok;
  }

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!validate()) return;
    setConfirming(true);
  }

  async function handleConfirm() {
    setLoading(true);
    setSubmitError("");
    try {
      const constraint = await getApiClient().createConstraint({
        description: formData.description.trim(),
        key: formData.key.trim(),
        commaSeparatedValues: formData.commaSeparatedValues,
      });

      queueToast("Constraint created.");
      setFormData({ description: "", key: "", commaSeparatedValues: "" });
      setConfirming(false);
      onClose();

      await revalidator.revalidate();

      setTimeout(() => {
        setCurrentConstraint(constraint.id);
        scrollToElement(`constraintcard_${constraint.id}`, "smooth", "start");
      }, 250);
    } catch (err) {
      setSubmitError(extractErrorMessage(err, "Failed to create constraint"));
      setConfirming(false);
    } finally {
      setLoading(false);
    }
  }

  if (!isOpen) return null;

  if (confirming) {
    return (
      <div className="border-b-4 border-magenta/20 bg-purple-500/5 px-4 py-3">
        <p className="text-sm text-gray-800 mb-3">
          Create constraint{" "}
          <span className="font-semibold">
            &lsquo;{formData.description}&rsquo;
          </span>
          ?
        </p>
        {submitError && (
          <p className="text-red-500 text-xs mb-2">{submitError}</p>
        )}
        <div className="flex gap-2">
          <button
            className="px-4 py-1.5 text-sm font-semibold text-white bg-purple-700 hover:bg-purple-600 rounded disabled:opacity-50"
            disabled={loading}
            onClick={handleConfirm}
          >
            {loading ? "Creating…" : "Yes, create"}
          </button>
          <button
            className="px-4 py-1.5 text-sm font-semibold text-gray-600 hover:underline"
            onClick={() => setConfirming(false)}
          >
            Back
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="border-b-4 border-magenta/20 bg-purple-500/5 px-4 py-3">
      <form
        onSubmit={handleSubmit}
        className="flex items-start md:flex-row flex-col gap-3 flex-wrap"
      >
        <div className="flex flex-col gap-2">
          <div className="flex flex-col">
            <input
              type="text"
              className="border-2 rounded p-1 w-auto focus:ring-0 focus:border-current placeholder-gray-300 text-sm"
              placeholder="Description"
              value={formData.description}
              onChange={(e) => {
                setFormData({ ...formData, description: e.target.value });
                setErrors({ ...errors, description: "" });
              }}
            />
            {errors.description && (
              <p className="text-red-500 text-xs mt-0.5">
                {errors.description}
              </p>
            )}
          </div>
          <div className="flex flex-col">
            <input
              type="text"
              className="border-2 rounded p-1 w-auto focus:ring-0 focus:border-current placeholder-gray-300 text-sm"
              placeholder="What it's for (e.g. userId)"
              value={formData.key}
              onChange={(e) => {
                setFormData({ ...formData, key: e.target.value });
                setErrors({ ...errors, key: "" });
              }}
            />
            {errors.key && (
              <p className="text-red-500 text-xs mt-0.5">{errors.key}</p>
            )}
          </div>
        </div>

        <div className="flex flex-col">
          <textarea
            className="border-2 rounded p-1 md:min-w-64 h-20 focus:ring-0 focus:border-current placeholder-gray-300 text-sm resize"
            placeholder="Who / which it's for (comma separated)"
            spellCheck={false}
            value={formData.commaSeparatedValues}
            onChange={(e) => {
              setFormData({
                ...formData,
                commaSeparatedValues: e.target.value,
              });
              setErrors({ ...errors, commaSeparatedValues: "" });
            }}
          />
          {errors.commaSeparatedValues && (
            <p className="text-red-500 text-xs mt-0.5">
              {errors.commaSeparatedValues}
            </p>
          )}
        </div>

        <div className="flex items-center gap-2">
          <button
            type="submit"
            className="bg-purple-700 text-white font-bold text-sm px-5 py-2 rounded hover:bg-purple-600 active:bg-purple-800"
          >
            + Create
          </button>
          <button
            type="button"
            className="text-sm text-gray-500 font-semibold hover:underline px-2 py-1"
            onClick={onClose}
          >
            Close
          </button>
        </div>
      </form>
    </div>
  );
}
