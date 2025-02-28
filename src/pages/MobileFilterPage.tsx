import React from 'react';
import {
  Paper,
  Typography,
  TextField,
  Select,
  MenuItem,
  FormControl,
  FormLabel,
  FormControlLabel,
  RadioGroup,
  Radio,
  CircularProgress,
  Theme,
  Chip,
} from '@material-ui/core';
import { makeStyles } from '@material-ui/styles';
import { History } from 'history';
import clsx from 'clsx';
import {
  modulesStore,
  authStore,
  observer,
  action,
  MODULES_PER_PAGE_OPTIONS,
} from '~store';
import { ModuleSearchFilter } from '~types';
import { getModules } from '~api';

interface IMobileFilterPageProps {
  history: History;
}

interface IStyleProps {
  searchValue: boolean;
}

const useStyles = makeStyles<Theme, IStyleProps>((theme: Theme) => ({
  root: {
    width: '100vw',
    height: `calc(100vh - 56px - ${theme.spacing(2)}px)`,
  },
  paperContainer: {
    margin: 'auto',
    width: '100%',
    maxWidth: 360,
  },
  paper: {
    margin: theme.spacing(2),
    padding: theme.spacing(2),
    display: 'flex',
    justifyContent: 'center',
    alignContent: 'center',
  },
  search: {
    width: '100%',
    marginBottom: 0,
    transition: theme.transitions.create('margin', {
      easing: theme.transitions.easing.sharp,
      duration: theme.transitions.duration.shorter,
    }),
    marginTop: props => (props.searchValue ? 0 : -25),
  },
  radio: {
    display: 'flex',
    justifyContent: 'center',
    alignContent: 'center',
  },
  hidden: {
    display: 'none',
  },
  modulesPerPage: {
    display: 'flex',
    justifyContent: 'space-evenly',
    alignItems: 'center',
  },
  select: {
    marginLeft: theme.spacing(2),
  },
  searchProgress: {
    margin: theme.spacing(2),
    width: '100%',
    height: '100%',
  },
  tagChip: {
    marginRight: theme.spacing(1),
  },
}));

export default observer(() => {
  const [searching, setSearching] = React.useState(false);
  const [searchFocused, setSearchFocused] = React.useState(false);
  const [searchTimeout, setSearchTimeout] = React.useState(undefined as NodeJS.Timeout | undefined);

  const classes = useStyles({ searchValue: searchFocused || !!modulesStore.search });

  let { search } = modulesStore;
  const tags = search && search.match(/tag:\w+ /g);
  const tagAdornments = tags && tags.map(tag => (
    <Chip
      className={classes.tagChip}
      key={tag}
      size="small"
      color="primary"
      label={tag.replace('tag:', '')}
    />
  ));

  if (tags) {
    tags.forEach(tag => {
      search = search && search.replace(tag, '');
    });
    search = search && search.trim();
  }

  const onSearchChange = action(({ target }: React.ChangeEvent<HTMLInputElement>) => {
    if (tags) {
      modulesStore.setSearch(tags.join(' ') + target.value);
    } else {
      modulesStore.setSearch(target.value);
    }

    if (searchTimeout) clearTimeout(searchTimeout);

    setSearchTimeout(setTimeout(async () => {
      setSearching(true);
      await getModules();
      setSearching(false);
    }, 1500));
  });

  const onSearchKeyDown = action(({ key }: React.KeyboardEvent<HTMLInputElement>) => {
    // Handle pressing backspace on an empty input to delete tags
    if (key === 'Backspace' && !search && tags && tags.length > 0) {
      modulesStore.setSearch(modulesStore.search && modulesStore.search.slice(0, modulesStore.search.length - 1));
    }
  });

  const onSearchFocus = (): void => {
    setSearchFocused(true);
  };

  const onSearchBlur = (): void => {
    setSearchFocused(false);
  };

  const onFilterChange = action((e: React.ChangeEvent<{}>) => {
    const filter = (e.target as HTMLInputElement).value as ModuleSearchFilter;

    if (filter !== modulesStore.searchFilter) {
      modulesStore.setSearchFilter(filter);
      getModules();
    }
  });

  const onChangeModulesPerPage = (e: React.ChangeEvent<{ name?: string; value: unknown }>): void => {
    const modulesPerPage = e.target.value as number;

    if (modulesPerPage !== modulesStore.modulesPerPage) {
      if (modulesPerPage < modulesStore.modulesPerPage) {
        modulesStore.setModules(modulesStore.modules.slice(0, modulesPerPage));
      } else {
        getModules();
      }

      modulesStore.setModulesPerPage(modulesPerPage);
    }
  };

  return (
    <div className={classes.root}>
      <div className={classes.paperContainer}>
        <Paper className={classes.paper}>
          <TextField
            className={classes.search}
            label="Search"
            margin="normal"
            placeholder="Search module names"
            value={search}
            onKeyDownCapture={onSearchKeyDown}
            onChange={onSearchChange}
            onFocus={onSearchFocus}
            onBlur={onSearchBlur}
            InputProps={{
              startAdornment: tagAdornments,
              endAdornment: (searching && (
                <div>
                  <CircularProgress
                    size={20}
                    thickness={7}
                  />
                </div>
              )) || undefined,
            }}
            multiline
          />
        </Paper>
        <Paper className={classes.paper}>
          <FormControl component="fieldset">
            <FormLabel component="legend" focused={false}>Module Search Filters</FormLabel>
            <RadioGroup
              className={classes.radio}
              value={modulesStore.searchFilter}
              onChange={onFilterChange}
            >
              <FormControlLabel
                control={<Radio />}
                label="All Modules"
                value="all"
              />
              <FormControlLabel
                control={<Radio />}
                label="Trusted Modules"
                value="trusted"
              />
              <FormControlLabel
                control={<Radio />}
                label="My Modules"
                value="user"
                disabled
              />
              <FormControlLabel
                className={clsx(!authStore.isAdmin && classes.hidden)}
                control={<Radio />}
                label="Flagged Modules"
                value="flagged"
                hidden
              />
            </RadioGroup>
          </FormControl>
        </Paper>
        <Paper className={classes.paper}>
          <div className={classes.modulesPerPage}>
            <Typography>
                Modules per page:
            </Typography>
            <Select
              className={classes.select}
              value={modulesStore.modulesPerPage}
              onChange={onChangeModulesPerPage}
            >
              {MODULES_PER_PAGE_OPTIONS.map(n => (
                <MenuItem key={n} value={n}>{n}</MenuItem>
              ))}
            </Select>
          </div>
        </Paper>
      </div>
    </div>
  );
});
