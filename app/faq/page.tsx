import { ArrowLongLeftIcon } from "@heroicons/react/24/outline";
import Link from "next/link";

interface FAQ {
  question: string;
  answer: React.ReactNode;
}

const faqs: FAQ[] = [
  {
    question: "What is OpenProfile?",
    answer:
      "OpenProfile is an open-source resume builder. It's completely free to use.",
  },
  {
    question: "Where is my data stored?",
    answer: "Your data is stored in your browser.",
  },
  {
    question: "How do I import my resume?",
    answer: "Currently, it is not possible to import your resume.",
  },
  {
    question: "How can I support OpenProfile?",
    answer: (
      <>
        You can support OpenProfile by{" "}
        <a
          href="https://github.com/azmy60/openprofile"
          target="_blank"
          className="font-bold"
        >
          starring
        </a>{" "}
        the project on Github.
      </>
    ),
  },
  {
    question: "How do I contribute?",
    answer: "You can contribute by fixing bugs or adding templates.",
  },
];

export default function FAQPage() {
  return (
    <main className="relative mx-auto px-8 flex flex-col h-screen max-w-2xl pt-12">
      <Link
        href="/"
        className="text-gray-700 hover:bg-gray-100 rounded-md p-1 w-min"
      >
        <h1 className="text-gray-800 text-xl font-bold">OpenProfile</h1>
        <div className="w-max mt-2">
          <ArrowLongLeftIcon className="inline w-4 h-4" /> Back to resume
          builder
        </div>
      </Link>
      <div className="mt-10">
        <h1 className="text-4xl font-bold">FAQ</h1>
        <a
          href="https://github.com/azmy60/openprofile"
          target="_blank"
          className="block text-gray-700 mt-6 hover:underline underline-offset-8"
        >
          Enjoy OpenProfile? Give it a star on Github!
        </a>
      </div>
      <div className="flow-root mt-16">
        <div className="-my-8 divide-y divide-gray-100">
          {faqs.map((faq) => (
            <details
              key={faq.question}
              className="group py-8 [&_summary::-webkit-details-marker]:hidden"
            >
              <summary className="flex cursor-pointer items-center justify-between text-gray-900">
                <h2 className="text-lg font-medium">{faq.question}</h2>
                <svg
                  className="h-5 w-5 shrink-0 transition duration-300 group-open:-rotate-180"
                  xmlns="http://www.w3.org/2000/svg"
                  fill="none"
                  viewBox="0 0 24 24"
                  stroke="currentColor"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth="2"
                    d="M19 9l-7 7-7-7"
                  />
                </svg>
              </summary>
              <p className="mt-4 leading-relaxed text-gray-700">{faq.answer}</p>
            </details>
          ))}
        </div>
      </div>
    </main>
  );
}
