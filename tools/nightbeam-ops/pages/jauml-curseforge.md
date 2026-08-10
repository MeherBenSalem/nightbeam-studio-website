![Jauml Logo](https://cdn.modrinth.com/data/ihvBalM2/ed2e551c21e849d17802a8bc8938e553208e0d76_96.webp)

<p style="text-align: center;">[![Discord](https://img.shields.io/static/v1?label=&message=Discord&color=5865F2&style=for-the-badge&logo=discord&logoColor=white)](https://discord.gg/TJc3CxR4jK) [![YouTube](https://img.shields.io/static/v1?label=&message=YouTube&color=FF0000&style=for-the-badge&logo=youtube&logoColor=white)](https://www.youtube.com/@nightbeamstudio) [![GitHub](https://img.shields.io/static/v1?label=&message=GitHub&color=181717&style=for-the-badge&logo=github&logoColor=white)](https://github.com/MeherBenSalem/jauml) [![CurseForge](https://img.shields.io/static/v1?label=&message=CurseForge&color=F16436&style=for-the-badge&logo=curseforge&logoColor=white)](https://www.curseforge.com/members/nightbeamstudio/projects)</p>
<p style="text-align: center;">[![Modrinth](https://img.shields.io/static/v1?label=&message=Modrinth&color=1BD96A&style=for-the-badge&logo=modrinth&logoColor=white)](https://modrinth.com/mod/jauml)</p>
<p style="text-align: center;">[![Store](https://img.shields.io/static/v1?label=&message=Store&color=0B0F1A&style=for-the-badge)](https://nightbeam.dev/store) [![Pro](https://img.shields.io/static/v1?label=&message=Go%20Pro&color=A78BFA&style=for-the-badge)](https://nightbeam.dev/community)</p>

Jauml is a **lightweight configuration library** for Minecraft mods, built for developers who want clean JSON-based config management without fighting boilerplate, brittle parsers, or hard-to-extend settings code.

Designed as a solid foundation for other NightBeam (and third-party) mods, Jauml keeps configuration flexible, readable, and easy to grow as your project scales — while staying small enough for large modpacks.

<p style="text-align: center;">![Library](https://img.shields.io/badge/Library-Mod%20Dependency-green?style=for-the-badge) ![Multi-Loader](https://img.shields.io/badge/Fabric%20%7C%20Forge%20%7C%20NeoForge-Supported-blue?style=for-the-badge) ![Modpack Ready](https://img.shields.io/badge/Modpack-Ready-orange?style=for-the-badge)</p>
<p style="text-align: center;">![Performance Focused](https://img.shields.io/badge/Performance-Focused-red?style=for-the-badge) ![JSON Config](https://img.shields.io/badge/JSON-Config-lightgrey?style=for-the-badge)</p>

## Why Jauml?

* Clean API for reading and writing JSON configs
* Less boilerplate when adding new settings
* Validation-friendly design for safer defaults
* Easy to extend as your mod grows
* Lightweight dependency for large modpacks
* Shared foundation used across NightBeam projects
* Multi-loader support (Fabric, Forge, NeoForge)
* Built for maintainable, readable config code

# Features

| Feature | Description |
| --- | --- |
| JSON Config Core | Structured JSON-based configuration management |
| Lightweight API | Minimal surface area for common config tasks |
| Extensible Design | Add new settings without rewriting your config layer |
| Validation Ready | Keep configs consistent and recover from bad values more easily |
| Multi-Loader | Works as a shared library on Fabric, Forge, and NeoForge |
| Modpack Friendly | Small footprint suitable for large packs |
| Developer Focused | Built for mod authors, not end-user GUIs |
| NightBeam Standard | Same config foundation used by NightBeam Studio mods |

***

# Screenshots

## Library Overview

![Jauml overview](https://cdn.modrinth.com/data/ihvBalM2/images/31d7e43877bb652f245c04148b93834f0a91b7fd.jpeg)

<!-- Optional: replace with a clearer banner / code sample image -->
<!-- ![Jauml API sample](REPLACE_ME_IMGUR_URL) -->

# Usage for Developers

Jauml is a **library dependency**. Players usually install it because another mod requires it.

| Step | Action |
| --- | --- |
| Add dependency | Depend on Jauml from your Fabric / Forge / NeoForge build |
| Create config | Define your settings with Jauml’s JSON config helpers |
| Load on startup | Read and validate config when your mod initializes |
| Save changes | Write updates back through the same config layer |
| Ship with your mod | List Jauml as a required dependency on CurseForge / Modrinth |

All project source and updates live on GitHub:

`https://github.com/MeherBenSalem/jauml`

# Configuration

Jauml itself is a library. **Your mod** owns the config files.

Typical pattern:

* Your mod declares settings through Jauml
* JSON config files are generated / updated under the usual Minecraft config folder
* Invalid or missing values can be validated and restored to safe defaults

Example shape (illustrative):

```json
{
  "enabled": true,
  "debug": false,
  "values": {
    "exampleOption": 1
  }
}
```

Exact keys depend on the mod using Jauml.

# Compatibility

* Singleplayer
* Multiplayer / dedicated servers (as required by dependent mods)
* Fabric
* Forge
* NeoForge
* Large modpacks
* Client + server (library; follow the dependent mod’s side requirements)

# Frequently Asked Questions

## Do I need to install Jauml as a player?

Only if another mod lists it as a required dependency. CurseForge / Modrinth installers usually pull it automatically.

## Is Jauml a gameplay mod?

No. It is a configuration library for other mods.

## Can I use it in my own mod / modpack?

Yes. Include it as a dependency / allow it in packs like any NightBeam library.

## Does it hurt performance?

Impact is minimal. It is designed to stay lightweight.

## Where do I report bugs?

Discord is the fastest path: [https://discord.gg/TJc3CxR4jK](https://discord.gg/TJc3CxR4jK) — or open an issue on the GitHub repo.

## Does it replace Cloth Config / other config UIs?

Jauml focuses on **JSON config management for developers**. It is not a drop-in replacement for every config-screen library.

# Roadmap

### Planned Features

* Clearer public examples and docs for mod authors
* Stronger validation helpers
* More examples for Fabric / Forge / NeoForge setups
* Better migration helpers when config schemas change
* Expanded documentation on nightbeam.dev

# Support Development

[![Support on Ko-fi](https://cdn.prod.website-files.com/5c14e387dab576fe667689cf/670f5a0171bfb928b21a7e00_support_me_on_kofi_beige.png)](https://ko-fi.com/nightbeamstudio)

# Community & Support

* Discord: [https://discord.gg/TJc3CxR4jK](https://discord.gg/TJc3CxR4jK)
* GitHub: [https://github.com/MeherBenSalem/jauml](https://github.com/MeherBenSalem/jauml)
* Website: [https://nightbeam.dev](https://nightbeam.dev)
* Store: [https://nightbeam.dev/store](https://nightbeam.dev/store)
* Pro Membership: [https://nightbeam.dev/community](https://nightbeam.dev/community)
* CurseForge: [https://www.curseforge.com/members/nightbeamstudio/projects](https://www.curseforge.com/members/nightbeamstudio/projects)
* Modrinth: [https://modrinth.com/organization/nightbeam](https://modrinth.com/organization/nightbeam)

# License

Feel free to include Jauml in modpacks.

Please do not redistribute modified versions without permission.

## NightBeam Studio

_Explore more. Get lost less._

More mods, paid server tools, and Pro support: [Store](https://nightbeam.dev/store) · [Go Pro](https://nightbeam.dev/community) · [Discord](https://discord.gg/TJc3CxR4jK)
