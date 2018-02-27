"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
var Runtime;
(function (Runtime) {
    Runtime[Runtime["UnknownRuntime"] = 'Unknown'] = "UnknownRuntime";
    Runtime[Runtime["UnknownVersion"] = 'Unknown'] = "UnknownVersion";
    Runtime[Runtime["Windows_86"] = 'Windows_86'] = "Windows_86";
    Runtime[Runtime["Windows_64"] = 'Windows_64'] = "Windows_64";
    Runtime[Runtime["OSX"] = 'OSX'] = "OSX";
    Runtime[Runtime["CentOS_7"] = 'CentOS_7'] = "CentOS_7";
    Runtime[Runtime["Debian_8"] = 'Debian_8'] = "Debian_8";
    Runtime[Runtime["Fedora_23"] = 'Fedora_23'] = "Fedora_23";
    Runtime[Runtime["OpenSUSE_13_2"] = 'OpenSUSE_13_2'] = "OpenSUSE_13_2";
    Runtime[Runtime["SLES_12_2"] = 'SLES_12_2'] = "SLES_12_2";
    Runtime[Runtime["RHEL_7"] = 'RHEL_7'] = "RHEL_7";
    Runtime[Runtime["Ubuntu_14"] = 'Ubuntu_14'] = "Ubuntu_14";
    Runtime[Runtime["Ubuntu_16"] = 'Ubuntu_16'] = "Ubuntu_16";
    Runtime[Runtime["Linux_64"] = 'Linux_64'] = "Linux_64";
    Runtime[Runtime["Linux_86"] = 'Linux-86'] = "Linux_86";
})(Runtime = exports.Runtime || (exports.Runtime = {}));
function getRuntimeDisplayName(runtime) {
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
exports.getRuntimeDisplayName = getRuntimeDisplayName;
//# sourceMappingURL=platform.js.map