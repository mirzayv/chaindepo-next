import { common } from '@mui/material/colors';
import shadow from './shadow';
import typography from './typography';

/**
 * LIGHT THEME (DEFAULT)
 */
export const light = {
	palette: {
		type: 'light',
		background: {
			default: '#f4f6f8',
			paper: common.white,
		},
		// ChainDepo palette (AGENTS.md): accent teal-blue, navy text
		primary: {
			contrastText: '#ffffff',
			main: '#2F8FB5',
			dark: '#26789A',
		},
		secondary: {
			main: '#0B2236',
		},
		error: {
			main: '#C62828',
		},
		success: {
			main: '#1E8E5A',
		},
		warning: {
			main: '#E0A100',
		},
		text: {
			primary: '#0B2236',
			secondary: '#5A6B7B',
			dark: common.black,
		},
	},
	components: {
		MuiTypography: {
			styleOverrides: {
				root: {
					letterSpacing: '0',
				},
			},
			defaultProps: {
				variantMapping: {
					h1: 'h1',
					h2: 'h2',
					h3: 'h3',
					h4: 'h4',
					h5: 'h5',
					h6: 'h6',
					subtitle1: 'p',
					subtitle2: 'p',
					subtitle3: 'p',
					body1: 'p',
					body2: 'p',
				},
			},
		},
		MuiLink: {
			styleOverrides: {
				root: {
					color: 'var(--lg-tx-757575)',
					textDecoration: 'none',
				},
			},
		},
		MuiDivider: {
			styleOverrides: {
				root: {
					borderColor: 'var(--lg-ln-eee)',
				},
			},
		},
		MuiBox: {
			styleOverrides: {
				root: {
					padding: '0',
				},
			},
			makeStyles: {
				root: {
					padding: 0,
				},
			},
			sx: {
				'&.MuiBox-root': {
					component: 'div',
				},
			},
		},
		MuiContainer: {
			styleOverrides: {
				root: {
					maxWidth: 'inherit',
					padding: '0',
					'@media (min-width: 600px)': {
						paddingLeft: 0,
						paddingRight: 0,
					},
				},
			},
		},
		MuiCssBaseline: {
			styleOverrides: {
				html: { height: '100%' },
				body: { background: '#fff', height: '100%', minHeight: '100%' },
				p: {
					margin: '0',
				},
			},
		},
		MuiAvatar: {
			styleOverrides: {
				root: {
					marginLeft: '0',
				},
			},
		},
		MuiButton: {
			styleOverrides: {
				root: {
					color: 'var(--lg-tx-212121)',
					minWidth: 'auto',
					lineHeight: '1.2',
					boxShadow: 'none',
					ButtonText: {
						color: 'var(--lg-tx-212121)',
					},
				},
			},
		},
		MuiIconButton: {
			styleOverrides: {
				root: {},
			},
		},
		MuiListItemButton: {
			styleOverrides: {
				root: {
					padding: '0',
				},
			},
		},
		MuiList: {
			styleOverrides: {
				root: {
					padding: '0',
				},
			},
		},
		MuiListItem: {
			styleOverrides: {
				root: {
					MuiSelect: {
						backgroundColor: '#fafafa',
					},
					padding: '0',
				},
			},
		},
		MuiFormControl: {
			styleOverrides: {
				root: {
					width: '100%',
				},
			},
		},
		MuiFormControlLabel: {
			styleOverrides: {
				root: {
					marginRight: '0',
				},
			},
		},
		MuiSelect: {
			styleOverrides: {
				root: {},
				select: {
					textAlign: 'left',
				},
			},
		},
		MuiInputBase: {
			styleOverrides: {
				root: {
					input: {},
				},
			},
		},
		MuiOutlinedInput: {
			styleOverrides: {
				root: {
					height: '48px',
					width: '100%',
					backgroundColor: 'var(--lg-bg-fff)',
					input: {},
				},
				notchedOutline: {
					padding: '8px',
					top: '-9px',
					border: '1px solid var(--lg-ln-eee)',
				},
			},
		},
		MuiFormHelperText: {
			styleOverrides: {
				root: {
					margin: '5px 0 0 2px',
					lineHeight: '1.2',
				},
			},
		},
		MuiStepper: {
			styleOverrides: {
				root: {
					alignItems: 'center',
				},
			},
		},
		MuiTabPanel: {
			styleOverrides: {
				root: {
					padding: '0',
				},
			},
		},
		MuiSvgIcon: {
			styleOverrides: {
				root: {},
			},
		},
		MuiStepIcon: {
			styleOverrides: {
				root: {
					color: 'var(--lg-bg-fff)',
					borderRadius: '50%',
					border: '1px solid var(--lg-ln-eee)',
				},
				text: {
					fill: '#bdbdbd',
				},
			},
		},
		MuiStepConnector: {
			styleOverrides: {
				line: {
					borderColor: 'var(--lg-ln-eee)',
				},
			},
		},
		MuiStepLabel: {
			styleOverrides: {
				label: {
					fontSize: '14px',
				},
			},
		},
		MuiCheckbox: {
			styleOverrides: {
				root: {
					'&.Mui-checked': {
						color: '#2F8FB5',
					},
				},
			},
		},
		MuiFab: {
			styleOverrides: {
				root: {
					width: '40px',
					height: '40px',
					background: 'var(--lg-bg-fff)',
					color: 'var(--lg-tx-212121)',
				},
				hover: {
					background: 'var(--lg-bg-fff)',
				},
			},
		},
		MuiPaper: {
			styleOverrides: {
				root: {
					MuiMenu: {
						boxShadow: 'rgb(145 158 171 / 24%) 0px 0px 2px 0px, rgb(145 158 171 / 24%) -20px 20px 40px -4px',
					},
				},
			},
		},
		MuiMenuItem: {
			styleOverrides: {
				root: {
					padding: '6px 8px',
				},
			},
		},
		MuiAlert: {
			styleOverrides: {
				root: {
					boxShadow: 'none',
				},
			},
		},
		MuiChip: {
			styleOverrides: {
				root: {
					border: '1px solid var(--lg-ln-ddd)',
					color: 'var(--lg-tx-212121)',
				},
			},
		},
	},
	shadow,
	typography,
};

/**
 * DARK THEME: same components (their colors are CSS variables from scss/theme.css), dark palette.
 * Palette values stay real colors because MUI derives hover/alpha shades from them.
 */
export const dark = {
	...light,
	palette: {
		...light.palette,
		mode: 'dark',
		type: 'dark',
		background: {
			default: '#0B1520',
			paper: '#142231',
		},
		secondary: {
			main: '#8FA3B5',
		},
		error: {
			main: '#EF5350',
		},
		success: {
			main: '#3FBF7F',
		},
		warning: {
			main: '#F0B429',
		},
		text: {
			primary: '#E6EDF3',
			secondary: '#8FA3B5',
			dark: '#E6EDF3',
		},
		divider: '#1F2F3F',
	},
};
