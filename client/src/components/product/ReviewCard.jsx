import StarRating from '../ui/StarRating';

/** Review card from the PDP reviews block (39:79). */
export default function ReviewCard({ review }) {
  return (
    <article className="rounded-[8px] border border-black/10 bg-white p-6">
      <div className="flex items-center gap-[10px]">
        <StarRating value={review.rating} size={13} color="#ffbf33" />
        {review.verified && (
          <span className="text-label rounded-full bg-green px-2 py-[3px] text-[9px] text-black">
            Verified
          </span>
        )}
      </div>
      {review.title && <h4 className="mt-3 text-[15px] font-semibold">{review.title}</h4>}
      <p className="mt-3 text-[14px] leading-[1.55] text-grey-700">{review.body}</p>
      <p className="mt-4 text-[12px] text-grey-500">
        {review.authorName}
        {review.size && ` · Size ${review.size}`}
        {review.fit && ` · ${review.fit}`}
      </p>
    </article>
  );
}
