import { CensorType, Profanity } from "@2toad/profanity";

export default function cleanString(input: string): string {
    const profanity = new Profanity({
        grawlix: 'xxxx',
        grawlixChar: 'x',
        wholeWord: false,
    });
    return profanity.censor(input, CensorType.FirstChar);
}