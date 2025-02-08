import { Mail } from "./mail";

export interface MailResponse {
    data: Mail[],
    previousId?: number,
    nextId?: number
}