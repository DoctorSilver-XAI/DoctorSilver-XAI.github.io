interface Props {
  /** Initiales affichées en avatars (preuve sociale réelle et consentie). */
  avatars: string[];
  /** Libellé descriptif (ex. « Déjà confirmé : Dr Claron + 2 invités »). */
  label: string;
}

/** Preuve sociale honnête : avatars + libellé. N'affiche que des confirmations réelles. */
export default function SocialProof({ avatars, label }: Props) {
  return (
    <div className="proof">
      <div className="ava-stack" aria-hidden="true">
        {avatars.map((a, i) => (
          <span key={i} className={`ava ava--${(i % 3) + 1}`}>
            {a}
          </span>
        ))}
      </div>
      <span className="proof__txt">{label}</span>
    </div>
  );
}
