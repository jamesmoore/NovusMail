import { deleteMail, readMail } from "./api-client";
import { Mail } from "./models/mail";
import { useEffect } from "react";
import { useNavigate, useParams } from "react-router-dom";
import useAddressResponse from "./useAddressResponse";
import useUnreadCounts from "./useUnreadCounts";
import { useInvalidateDeletedMailItemsCache, useMailItems } from './useMailItems';
import MailboxItems from "./MailboxItems";

function Mailbox() {
    const { address: selectedAddress } = useParams();
    const navigate = useNavigate();

    const { data: addressResponse } = useAddressResponse();

    const { invalidate: invalidateDeleted } = useInvalidateDeletedMailItemsCache();

    async function onMailItemSelect(mail: Mail) {
        if (!mail.read) {
            await readMail(mail.id);
            mail.read = true;
            refetchUnread();
        }
        navigate(`/mail/${selectedAddress}/${mail.id}`);
    }

    async function onMailItemDelete(mail: Mail) {
        try {
            await deleteMail(mail.id);
            await refetch();
            if (!mail.read) {
                await refetchUnread();
            }
            await invalidateDeleted();
        }
        catch (error) {
            console.error('Failed to delete mail ' + error);
        };
    }

    const { refetch: refetchUnread } = useUnreadCounts();

    useEffect(() => {
        if (!selectedAddress) {
            const address = addressResponse?.addresses[0]?.addr;
            if (address) {
                navigate('/inbox/' + address);
            }
        }
    }, [selectedAddress, addressResponse, navigate])

    const {
        fetchNextPage,
        error,
        refetch,
        isFetching,
        isFetchingNextPage,
        isRefetching,
        data: mails,
        hasNextPage } = useMailItems(selectedAddress);

    return (
        <MailboxItems
            onMailItemDelete={onMailItemDelete}
            onMailItemSelect={onMailItemSelect}
            mails={mails}
            error={error}
            fetchNextPage={fetchNextPage}
            hasNextPage={hasNextPage}
            isFetching={isFetching}
            isFetchingNextPage={isFetchingNextPage}
            isRefetching={isRefetching}
        />
    );
}

export default Mailbox;