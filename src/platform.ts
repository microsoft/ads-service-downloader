
export enum Runtime {
	UnknownRuntime = <any>'Unknown',
	UnknownVersion = <any>'Unknown',
	Windows_86 = <any>'Windows_86',
	Windows_64 = <any>'Windows_64',
	OSX = <any>'OSX',
	CentOS_7 = <any>'CentOS_7',
	Debian_8 = <any>'Debian_8',
	Fedora_23 = <any>'Fedora_23',
	OpenSUSE_13_2 = <any>'OpenSUSE_13_2',
	SLES_12_2 = <any>'SLES_12_2',
	RHEL_7 = <any>'RHEL_7',
	Ubuntu_14 = <any>'Ubuntu_14',
	Ubuntu_16 = <any>'Ubuntu_16',
	Linux_64 = <any>'Linux_64',
	Linux_86 = <any>'Linux-86'
}

export function getRuntimeDisplayName(runtime: Runtime): string {
	switch (runtime) {
		case Runtime.Windows_64:
			return 'Windows';
		case Runtime.Windows_86:
			return 'Windows';
		case Runtime.OSX:
			return 'OSX';
		case Runtime.CentOS_7:
			return 'Linux';
		case Runtime.Debian_8:
			return 'Linux';
		case Runtime.Fedora_23:
			return 'Linux';
		case Runtime.OpenSUSE_13_2:
			return 'Linux';
		case Runtime.SLES_12_2:
			return 'Linux';
		case Runtime.RHEL_7:
			return 'Linux';
		case Runtime.Ubuntu_14:
			return 'Linux';
		case Runtime.Ubuntu_16:
			return 'Linux';
		case Runtime.Linux_64:
			return 'Linux';
		case Runtime.Linux_86:
			return 'Linux';
		default:
			return 'Unknown';
	}
}
