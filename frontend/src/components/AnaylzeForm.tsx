import { useState } from "react";
import { DELIMITER_ALIASES, type AnalyzeParams } from "#/lib/api";

interface AnalyzeFormProps {
  onSubmit: (params: AnalyzeParams) => void;
  isPending: boolean;
  error: Error | null;
}

const MAX_BYTES = 50 * 1024 * 1024;



export default function AnaylzeForm({onSubmit, isPending, error}:AnalyzeFormProps) {
  const [file, setFile] = useState<File | null>(null);
  const [delimiter, setDelimiter] = useState<string>("comma");
  const [customDelimiter, setCustomDelimiter] = useState<string>('');
  const [hasHeader, setHasHeader] = useState<boolean>(true);
  const [customRowNumber, setCustomRowNumber] = useState<number>(0);
  const usingCustom = delimiter === "custom";
  const resolvedDelimiter = usingCustom ? customDelimiter : delimiter;

  const tooBig = file != null && file.size > MAX_BYTES;
  const customInvalid = usingCustom && customDelimiter.length !== 1;
  const canSubmit = file != null && !tooBig && !customInvalid && !isPending;
  
  function submit() {
    if(!file || !canSubmit) return;
    console.log("this is supposed to submit");
    onSubmit({
      file,
      delimiter: resolvedDelimiter,
      headerRow: !hasHeader ? customRowNumber : 0
    })
  }

  return (
        <section className="rounded-xl border border-slate-200 bg-white p-6 shadow-sm">
           <div className="grid gap-5">
            <label className="grid gap-2">
              <span className="text-sm font-medium text-slate-700">CSV file</span>
              <input
                type="file"
                accept=".csv,.tsv,text/csv,text/tab-separated-values"
                onChange={(e) => setFile(e.target.files?.[0] ?? null)}
                className="block w-full text-sm text-slate-600 file:mr-4 file:rounded-md file:border-0 file:bg-slate-900 file:px-4 file:py-2 file:text-sm file:font-medium file:text-white hover:file:bg-slate-700"
              />
              {tooBig && (
                <span className="text-sm text-red-600">
                  File is {(file!.size / 1024 / 1024).toFixed(1)} MB — the limit is 50 MB.
                </span>
              )}

            </label>
            <div className="grid gap-2 sm:grid-cols-2">
              <label className="grid gap-2">
                <span className="text-sm font-medium text-slate-700">Delimiter</span>
                <select
                  value={delimiter}
                  onChange={(e) => setDelimiter(e.target.value)}
                  className="rounded-md border border-slate-300 px-3 py-2 text-sm"
                >
                  {DELIMITER_ALIASES.map((alias) => (
                    <option key={alias} value={alias}>
                      {alias}
                    </option>
                  ))}
                  <option value="custom">custom</option>
                </select>
              </label>
              {usingCustom && (
                <label className="grid gap-2">
                  <span className="text-sm font-medium text-slate-700">Custom character</span>
                  <input
                    type="text"
                    maxLength={1}
                    value={customDelimiter}
                    onChange={(e) => setCustomDelimiter(e.target.value)}
                    placeholder="a single character"
                    className="rounded-md border border-slate-300 px-3 py-2 text-sm"
                  />
                </label>
              )}
            </div>
            <div className="flex gap-2 w-full items-center justify-start p-2">
              <label className="flex items-center gap-2 text-sm text-slate-700">
                <input
                  type="checkbox"
                  checked={hasHeader}
                  onChange={(e) => setHasHeader(e.target.checked)}
                  className="h-4 w-4 rounded border-slate-300"
                />
                First row is a header
              </label>
              {!hasHeader && <input
                type="number"
                className="rounded-lg p-2 border-2"
                value={customRowNumber}
                onChange={(e) => setCustomRowNumber(Number(e.target.value))}
              />}
            </div>
            
            <div className="flex items-center gap-3">
              <button
                type="button"
                onClick={submit}
                disabled={!canSubmit}
                className="rounded-md bg-slate-900 px-5 py-2 text-sm font-medium text-white hover:bg-slate-700 disabled:cursor-not-allowed disabled:opacity-40"
              >
                {isPending ? 'Analyzing…' : 'Analyze dataset'}
              </button>
              {isPending && <span className="text-sm text-slate-500">This can take a few seconds.</span>}
            </div>


           </div>
        </section>
  )
}

