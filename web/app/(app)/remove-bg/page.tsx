import BackgroundRemover from "@/components/remove-bg/BackgroundRemover";

export default function RemoveBgPage() {
  return (
    <main className=" py-10 px-4 sm:px-6 lg:px-8">
      <div className="max-w-5xl mx-auto mb-8">
        <h1 className="text-3xl text-xl font-bold text-neutral-900 tracking-tight">
          Background remover
        </h1>
        <p className="text-neutral-900 mt-1">
          Remove photo backgrounds instantly without compromising the original resolution
        </p>
      </div>
      <BackgroundRemover />
    </main>
  );
}