import { useState, useEffect, useContext } from 'react';
import { useNavigate } from 'react-router-dom';
import AddressContext from './AddressContext';
import { AppBar, Box, Button, Dialog, DialogActions, DialogContent, DialogContentText, DialogTitle, Divider, Drawer, Fab, IconButton, List, ListItem, ListItemButton, ListItemIcon, ListItemText, Toolbar, Tooltip, Typography } from '@mui/material';
import Grid from '@mui/material/Grid2';
import ContentCopy from '@mui/icons-material/ContentCopy';
import { InfiniteData, useInfiniteQuery, useQuery, useQueryClient } from '@tanstack/react-query';
import { fetchAddress, fetchDomain, fetchMails, deleteMail } from './api-client';

import SettingsIcon from '@mui/icons-material/Settings';

import MailIcon from '@mui/icons-material/Mail';
import MenuIcon from '@mui/icons-material/Menu';
import DraftsIcon from '@mui/icons-material/Drafts';
import MailboxItem from './MailboxItem';
import { useInView } from 'react-intersection-observer';
import { MailResponse } from './models/mail-response';

const handleCopy = async (text: string) => {
  try {
    await navigator.clipboard.writeText(text);
  } catch (err) {
    console.error('Failed to copy:', err);
  }
};

function Mailbox() {
  const { selectedAddress, setSelectedAddress } = useContext(AddressContext);
  const [deleteConfirm, setDeleteConfirm] = useState(false);
  const [deleteItemKey, setDeleteItemKey] = useState<string | null>(null);
  const navigate = useNavigate();

  const { ref, inView } = useInView();

  const drawerWidth = 240;

  const [mobileOpen, setMobileOpen] = useState(false);
  const [isClosing, setIsClosing] = useState(false);

  const handleDrawerClose = () => {
    setIsClosing(true);
    setMobileOpen(false);
  };

  const handleDrawerTransitionEnd = () => {
    setIsClosing(false);
  };

  const handleDrawerToggle = () => {
    console.log(isClosing);
    if (!isClosing) {
      setMobileOpen(!mobileOpen);
    }
  };

  async function copyClicked() {
    await handleCopy(selectedAddress + domainName);
  }

  async function onMailItemSelect(itemKey: string) {
    navigate('/mail/' + itemKey);
  }

  async function onMailItemDelete(itemKey: string) {
    deleteMailEvent(itemKey);
  }

  async function deleteMailEvent(itemKey: string) {
    setDeleteItemKey(itemKey);
    setDeleteConfirm(true);
  }

  const queryClient = useQueryClient();

  async function deleteYes() {
    deleteMail(deleteItemKey!)
      .then(() => {
        setDeleteConfirm(false);

        const newPagesArray =
          mails?.pages.map((page) =>
          ({
            data: page.data.filter((mail) => mail.id !== deleteItemKey),
            previousId: page.previousId,
            nextId: page.nextId
          } as MailResponse)
          ) ?? [];

        const key = ['mail', selectedAddress];
        queryClient.setQueryData(key, (data: InfiniteData<MailResponse, number[]>) =>
        (
          {
            pages: newPagesArray,
            pageParams: data.pageParams,
          }
        )
        );
      })
      .catch(error => {
        console.error('Failed to delete mail ' + error);
      });
  }

  async function deleteNo() {
    setDeleteConfirm(false);
  }


  const { data: domainName } = useQuery(
    {
      queryKey: ["domain"],
      queryFn: fetchDomain
    }
  );

  const { data: addressesResponse, isLoading: addressIsLoading } = useQuery(
    {
      queryKey: ["addresses"],
      queryFn: fetchAddress
    }
  )

  useEffect(
    () => {
      if (addressesResponse && addressesResponse.addresses.length > 0) {
        const addresses = addressesResponse.addresses;
        if (selectedAddress === '' || addresses.every(p => p.addr !== selectedAddress)) {
          setSelectedAddress(addresses[addresses.length - 1].addr);
        }
      }
    },
    [addressesResponse]
  );

  const {
    status,
    data: mails,
    error,
    isFetching,
    isFetchingNextPage,
    isFetchingPreviousPage,
    fetchNextPage,
    hasNextPage,
    hasPreviousPage,
  } = useInfiniteQuery({
    queryKey: ['mail', selectedAddress],
    queryFn: async ({
      pageParam,
    }): Promise<MailResponse> => fetchMails(selectedAddress, pageParam),
    initialPageParam: 1,
    getPreviousPageParam: (firstPage) => firstPage.previousId,
    getNextPageParam: (lastPage) => lastPage.nextId,
    // refetchInterval: addressesResponse ? addressesResponse?.refreshInterval * 1000 : false,
    enabled: selectedAddress !== undefined,
  });

  useEffect(() => {
    if (inView) {
      fetchNextPage()
    }
  }, [fetchNextPage, inView])

  if (addressIsLoading) {
    return <div>Loading...</div>;
  }

  if (error) {
    return <div className="error">{error.message}</div>;
  }

  const drawer = (
    <div>
      <Toolbar />
      <Divider />
      <List>
        {addressesResponse?.addresses.map((address, _index) => (
          <ListItem key={address.addr} disablePadding>
            <ListItemButton
              onClick={(_e) => {
                setSelectedAddress(address.addr);
                if (mobileOpen) {
                  handleDrawerToggle();
                }
              }}
              selected={address.addr === selectedAddress}
            >
              <ListItemIcon>
                {address.addr === selectedAddress ? <DraftsIcon /> : <MailIcon />}
              </ListItemIcon>
              <ListItemText primary={address.addr} />
            </ListItemButton>
          </ListItem>
        ))}
      </List>
      <Divider />
      <div>
        Status: {status} <br />
        IsFetchingPreviousPage: {isFetchingPreviousPage} <br />
        hasPreviousPage: {hasPreviousPage} <br />
        inView: {inView ? "true" : "false"}<br />
        isClosing: {isClosing ? "true" : "false"}<br />
        mobileOpen: {mobileOpen ? "true" : "false"}<br />
      </div>
    </div>
  );

  return (
    <Box sx={{ display: 'flex', height: "100dvh" }}>
      <AppBar
        position="fixed"
        sx={{
          width: { sm: `calc(100% - ${drawerWidth}px)` },
          ml: { sm: `${drawerWidth}px` },
        }}
      >
        <Toolbar>
          <IconButton
            color="inherit"
            aria-label="open drawer"
            edge="start"
            onClick={handleDrawerToggle}
            sx={{ mr: 2, display: { sm: 'none' } }}
          >
            <MenuIcon />
          </IconButton>
          <Typography variant="h6" noWrap component="div">
            {selectedAddress}@{domainName}
          </Typography>
          <Tooltip title="Copy">
            <IconButton onClick={copyClicked}>
              <ContentCopy />
            </IconButton>
          </Tooltip>
        </Toolbar>
      </AppBar>
      <Box
        component="nav"
        sx={{ width: { sm: drawerWidth }, flexShrink: { sm: 0 } }}
        aria-label="mailbox folders"
      >
        <Drawer
          //container={container}
          variant="temporary"
          open={mobileOpen}
          onTransitionEnd={handleDrawerTransitionEnd}
          onClose={handleDrawerClose}
          ModalProps={{
            keepMounted: true, // Better open performance on mobile.
          }}
          sx={{
            display: { xs: 'block', sm: 'none' },
            '& .MuiDrawer-paper': { boxSizing: 'border-box', width: drawerWidth },
          }}
        >
          {drawer}
        </Drawer>
        <Drawer
          variant="permanent"
          sx={{
            display: { xs: 'none', sm: 'block' },
            '& .MuiDrawer-paper': { boxSizing: 'border-box', width: drawerWidth },
          }}
          open
        >
          {drawer}
        </Drawer>
      </Box>

      <Box
        sx={{
          display: "flex",
          flexDirection: "column",
          flex: "1 1 auto",
          width: {
            xs: "100%",
            sm: `calc(100% - ${drawerWidth}px)`
          },
        }}
      >

        <Toolbar />
        <Grid flex="1 0 auto" paddingLeft={1} paddingRight={1}>
          {isFetching && (<>Loading...</>)}
          {mails && mails.pages && mails.pages.map((mailPage) => {
            return mailPage.data.map((mail) =>
            (
              <MailboxItem mail={mail} onDelete={onMailItemDelete} onSelect={onMailItemSelect} />
            ))
          }
          )
          }

          <Box flex="0 0 auto" display="flex" justifyContent={'center'}>
            <button
              ref={ref}
              onClick={() => fetchNextPage()}
              disabled={!hasNextPage || isFetchingNextPage}
            >
              {isFetchingNextPage
                ? 'Loading more...'
                : hasNextPage
                  ? 'Load Newer'
                  : 'Nothing more to load'}
            </button>
          </Box>
          <Box flex="0 0 auto" display="flex" justifyContent={'center'}>
            {isFetching && !isFetchingNextPage
              ? 'Background Updating...'
              : null}
          </Box>

        </Grid>


      </Box >

      <Fab size="small" sx={{
        position: 'absolute',
        bottom: 48 + 16,
        right: 16,
      }} onClick={() => { navigate('/manage'); }}>
        <SettingsIcon />
      </Fab>

      <Dialog
        open={deleteConfirm}
        onClose={deleteNo}
        aria-labelledby="alert-dialog-title"
        aria-describedby="alert-dialog-description"
      >
        <DialogTitle id="alert-dialog-title">
          Confirm
        </DialogTitle>
        <DialogContent>
          <DialogContentText id="alert-dialog-description">
            delete?
          </DialogContentText>
        </DialogContent>
        <DialogActions>
          <Button onClick={deleteNo}>No</Button>
          <Button onClick={deleteYes} autoFocus>
            Yes
          </Button>
        </DialogActions>
      </Dialog>

    </Box>
  );
}

export default Mailbox;