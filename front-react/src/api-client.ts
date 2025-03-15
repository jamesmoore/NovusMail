import { AddressesResponse } from "./models/addresses-response";
import { MailMessage } from "./models/mail-message";
import { MailResponse } from "./models/mail-response";
import { UnreadCount } from "./models/unread-count";

const defaultHeaders = {
    'Content-Type': 'application/json',
};

/** To support local development - add this env variable to the file `.env.development.local`, which should be located alongside package.json  */
const BaseUrl = import.meta.env.VITE_API_BASE_URL ?? '';
const ApiUrl = `${BaseUrl}/api`;

const fetchDomain = async () => {
    const response = await fetch(`${ApiUrl}/domain`, {
        method: 'GET',
        headers: defaultHeaders,
    });
    return response.text();
};

const fetchAddress = async () => {
    const response = await fetch(`${ApiUrl}/addresses`, {
        method: 'GET',
        headers: defaultHeaders,
    });
    return response.json() as Promise<AddressesResponse>;
};

const getAddress = async (newAddressText: string) => {
    const response = await fetch(`${ApiUrl}/address/${newAddressText}`, {
        method: 'GET',
        headers: defaultHeaders
    });
    if (response.status === 404) {
        return '';
    }
    else if (response.status === 200) {
        return response.text();
    }
}

const addAddress = async (newAddressText: string) => {
    const response = await fetch(`${ApiUrl}/address/${newAddressText}`, {
        method: 'PUT',
        headers: defaultHeaders
    });
    return response.status === 200;
}

const deleteAddress = async (selectedAddress: string) => {
    const response = await fetch(`${ApiUrl}/address/${selectedAddress}`, {
        method: 'DELETE',
        headers: defaultHeaders
    });
    return response.status === 200;
}

const fetchMails = async (selectedAddress: string, cursorId: string) => {
    const response = await fetch(`${ApiUrl}/mails`, {
        method: 'POST',
        body: JSON.stringify(
            {
                addr: selectedAddress,
                cursorId: cursorId
            }
        ),
        headers: defaultHeaders,
    });
    return response.json() as Promise<MailResponse>;
};

const fetchDeletedMails = async (cursorId: string) => {
    const response = await fetch(`${ApiUrl}/mails`, {
        method: 'POST',
        body: JSON.stringify(
            {
                cursorId: cursorId,
                deleted: true
            }
        ),
        headers: defaultHeaders,
    });
    return response.json() as Promise<MailResponse>;
};

const fetchMail = async (id: string) => {
    const response = await fetch(`${ApiUrl}/mail/${id}`, {
        method: 'GET',
        headers: defaultHeaders,
    });
    return response.json() as Promise<MailMessage>;
}

const deleteMail = async (id: string) => {
    await fetch(`${ApiUrl}/mail/${id}`, {
        method: 'DELETE',
        headers: defaultHeaders,
    })
};

const deleteMails = async (address: string) => {
    await fetch(`${ApiUrl}/mails/${address}`, {
        method: 'DELETE',
        headers: defaultHeaders,
    })
};

const emptyDeletedMails = async () => {
    await fetch(`${ApiUrl}/emptyDeletedMails`, {
        method: 'POST',
        headers: defaultHeaders,
    })
};

const readMail = async (id: string) => {
    await fetch(`${ApiUrl}/readMail`, {
        method: 'POST',
        body: JSON.stringify(
            {
                id: id,
            }
        ),
        headers: defaultHeaders,
    })
};

const readAllMail = async (address: string) => {
    await fetch(`${ApiUrl}/readAllMail`, {
        method: 'POST',
        body: JSON.stringify(
            {
                address: address,
            }
        ),
        headers: defaultHeaders,
    })
};

const fetchUnreadCounts = async () => {
    const response = await fetch(`${ApiUrl}/unreadCounts`, {
        method: 'GET',
        headers: defaultHeaders,
    });
    return response.json() as Promise<UnreadCount[]>;
};

export {
    fetchDomain,
    fetchAddress,
    getAddress,
    addAddress,
    deleteAddress,
    fetchMails,
    fetchDeletedMails,
    fetchMail,
    deleteMail,
    deleteMails,
    emptyDeletedMails,
    readMail,
    fetchUnreadCounts,
    readAllMail,
};