# frameworkBTC — Inventaire des composants

> Catalogue exhaustif des composants UI Bitcoin à construire.
> Total : **38 composants atomiques + 15 blocks composés + 20 hooks ≈ 73 unités**.

## Philosophie des variantes

Plutôt que de multiplier les variantes visuelles (qui explose la maintenance), chaque composant suit ces 3 règles :

1. **Compound API à la Radix** — `<Balance.Root>`, `<Balance.Value>`, `<Balance.Unit>` plutôt qu'une seule prop `variant`.
2. **`asChild` partout** — l'utilisateur passe son propre élément stylé.
3. **CVA pour 2 variantes max** — `size: sm|md|lg`, `tone: default|muted`. Tout le reste = composition.

Résultat : un composant = une seule implémentation de référence, infiniment customisable sans fork.

---

## Légende

- `[ ]` à faire — `[~]` en cours — `[x]` livré
- **Phase** indique quand le composant est planifié (0 → 5)
- **Variantes** : nombre de variantes de référence à livrer (CVA)
- **Composition** : stratégie pour rester générique

---

## A. Composants d'affichage (read-only) — 15

| # | Composant | Phase | Variantes | Composition / slots |
|---|---|---|---|---|
| A1 | `[ ]` Balance | 1 | 2 (`size`) | `.Root .Value .Unit .Toggle` — msat togglable |
| A2 | `[ ]` Address | 1 | 1 | `truncate="middle"\|"tail"\|false`, `asChild` pour wrap link |
| A3 | `[ ]` Transaction | 4 | 1 | `.Status .Confirmations .Fee .Amount` — layout par le consommateur |
| A4 | `[ ]` TXID | 1 | 1 | Identique à Address + slot copy-on-click |
| A5 | `[ ]` BlockHeight | 1 | 1 | `format="number"\|"compact"`, live update |
| A6 | `[ ]` BlockClock | 4 | 1 (ring) | Headless émet `{secondsSinceLastBlock, expectedSeconds}` |
| A7 | `[ ]` MempoolStats | 4 | 0 | Compound pur `.PendingTx .VSize .Fees` |
| A8 | `[ ]` FeeRate | 4 | 1 | `tier="auto"\|low\|medium\|high` |
| A9 | `[ ]` ConfirmationsBadge | 1 | 4 tones (CVA auto) | Tone calculé depuis le count |
| A10 | `[ ]` ExchangeRate | 1 | 1 | `base="BTC" quote="USD"` |
| A11 | `[ ]` SatBtcSwitch | 1 | 1 | Headless toggle, contrôlé + non-contrôlé |
| A12 | `[ ]` FiatAmount | 1 | 1 | Wrap Balance + `useBitcoinPrice` |
| A13 | `[ ]` MiningHashrate | 4 | 1 | `unit="EH/s"\|"auto"` |
| A14 | `[ ]` HalvingCountdown | 4 | 1 | `.Blocks .Date .Progress` |
| A15 | `[ ]` DifficultyAdjustment | 4 | 1 | `.Delta .ETA .Progress` |

## B. Composants d'entrée — 10

| # | Composant | Phase | Variantes | Composition / slots |
|---|---|---|---|---|
| B1 | `[ ]` AddressInput | 2 | 1 | `.Field .Status .Paste .Scan`, validation network-aware |
| B2 | `[ ]` AmountInput | 2 | 1 | `.Root .Field .UnitSwitch .FiatPreview .MaxButton` — BigInt sats interne |
| B3 | `[ ]` InvoiceInput | 2 | 1 | Paste BOLT11 + decode preview en slot |
| B4 | `[ ]` LightningAddressInput | 2 | 1 | `user@domain` → résolution LNURL |
| B5 | `[ ]` SeedPhraseInput | 2 | 1 | `wordCount: 12\|15\|18\|21\|24`, paste split |
| B6 | `[ ]` PasswordInput | 2 | 1 | `.Root .Field .EntropyMeter .Toggle` — zxcvbn-ts |
| B7 | `[ ]` DerivationPathInput | 5 | 1 | Chips preset (BIP44/49/84/86) |
| B8 | `[ ]` PSBTInput | 4 | 1 | Multimodal : textarea + drop file + QR UR — slot par source |
| B9 | `[ ]` XpubInput | 5 | 1 | Valide xpub/ypub/zpub/vpub/Vpub + descripteurs |
| B10 | `[ ]` MessageSigningInput | 5 | 1 | `.Message .Address .Signature` |

## C. Composants d'action — 8

| # | Composant | Phase | Variantes | Composition / slots |
|---|---|---|---|---|
| C1 | `[ ]` SendButton | 3 | 1 | Loading/disabled via data-attributes |
| C2 | `[ ]` ReceiveButton | 3 | 1 | Idem |
| C3 | `[ ]` ConnectWallet | 3 | 1 | `.Root .Trigger .Modal .ProviderList .Provider` — auto-detect WebLN/NWC/BitcoinConnect |
| C4 | `[ ]` ScanQR | 2 | 1 | Caméra primitive headless + modale référence — décode BIP21, BOLT11, LNURL, PSBT/UR |
| C5 | `[ ]` CopyAddress | 3 | 1 | `asChild` autour de n'importe quel child |
| C6 | `[ ]` SignMessageButton | 3 | 1 | Callback ou render-prop |
| C7 | `[ ]` ExportPSBT | 4 | 1 | `.Trigger .Download .Copy .QR` |
| C8 | `[ ]` BroadcastTx | 3 | 1 | Bouton + status |

## D. Flows composés (blocks) — 10

Enregistrés `type: "registry:block"` → tirent plusieurs composants en une commande `add`.

| # | Block | Phase | Composé de |
|---|---|---|---|
| D1 | `[ ]` PaymentRequest | 4 | Toggle on-chain/LN + Address + QR + CopyAddress |
| D2 | `[ ]` SendForm | 4 | AddressInput + AmountInput + FeeSelector + SendButton |
| D3 | `[ ]` ReceiveScreen | 4 | Tabs Radix on-chain / LN invoice |
| D4 | `[ ]` WalletConnectorModal | 4 | Impl complète de ConnectWallet |
| D5 | `[ ]` AddressBook | 5 | List + add/edit/delete, slot adapter local-storage |
| D6 | `[ ]` TransactionList | 4 | Virtualized `@tanstack/react-virtual`, render-prop row |
| D7 | `[ ]` UTXOSelector | 4 | Coin control, branch-and-bound preview |
| D8 | `[ ]` CoinControlPanel | 5 | UTXOSelector + change preview + score privacy |
| D9 | `[ ]` ChannelsList | 5 | Channels LN, barres capacité, render-prop row |
| D10 | `[ ]` SwapInterface | 5 | Submarine swap, provider pluggable |

## E. Éducation / onboarding — 5

| # | Block | Phase | Composé de / notes |
|---|---|---|---|
| E1 | `[ ]` SeedBackupWizard | 5 | Stepper multi-étapes + verification |
| E2 | `[ ]` AddressTypeExplainer | 5 | Cards + tooltips (P2PKH/P2SH/P2WPKH/P2TR) |
| E3 | `[ ]` FeeExplainer | 5 | Démo interactive sat/vB live |
| E4 | `[ ]` NetworkSwitch | 5 | Toggle mainnet/testnet/signet/regtest, met à jour le context |
| E5 | `[ ]` HardwareWalletPrompt | 5 | Modale Ledger/Trezor/Coldcard/BitBox/Jade |

## F. Data viz — 5

| # | Composant | Phase | Notes |
|---|---|---|---|
| F1 | `[ ]` MempoolBlocks | 4 | Animation blocs (style mempool.space) — Framer Motion, headless émet data |
| F2 | `[ ]` FeeHistoryChart | 4 | Wrap Recharts/visx, render-prop custom |
| F3 | `[ ]` PriceChart | 4 | Même pattern, data source pluggable |
| F4 | `[ ]` BlockExplorerEmbed | 5 | Sans iframe, cards récap |
| F5 | `[ ]` NodeGraph | 5 | Graph LN (react-force-graph), slot tooltip |

## G. Hooks / utilitaires — 20

Tous sont de fines coques React sur `@btc-ui/core`. SWR/TanStack Query en **peerDependency**.

### Phase 1
- `[ ]` useBitcoinPrice
- `[ ]` useBlockHeight
- `[ ]` useUnitFormatter
- `[ ]` useNetwork

### Phase 2
- `[ ]` useMempoolFees
- `[ ]` useAddressBalance
- `[ ]` useTransaction
- `[ ]` useLightningInvoice
- `[ ]` useQRCode
- `[ ]` useScanQR
- `[ ]` useClipboard
- `[ ]` useBip21
- `[ ]` useBolt11
- `[ ]` useLnurl

### Phase 3
- `[ ]` useWebLN
- `[ ]` useNostrWalletConnect
- `[ ]` useBitcoinConnect

### Phase 4–5
- `[ ]` usePsbt
- `[ ]` useFiatRate
- `[ ]` useExchangeRateAggregator

---

## Comment rendre les composants génériques pour tous les designs ?

Pour qu'un composant fonctionne dans **n'importe quel design system** (shadcn, Material UI, Chakra, brand custom…), on combine 4 patterns :

### 1. **Séparation logique / vue**
- `@btc-ui/core` (TS pur) gère la logique : validation d'adresse, conversion sat ↔ BTC, parsing BOLT11.
- `@btc-ui/react` expose des **hooks** + des **primitives unstyled**.
- L'utilisateur peut consommer la logique sans jamais utiliser nos composants visuels.

### 2. **Compound components (à la Radix)**
```tsx
<Balance value={50_000n}>
  <Balance.Value />       {/* contrôle indépendant de l'affichage du nombre */}
  <Balance.Unit />        {/* contrôle indépendant de l'unité */}
  <Balance.Toggle />      {/* contrôle indépendant du switch sat/BTC */}
</Balance>
```
L'utilisateur réordonne, omet, ou stylise chaque slot indépendamment.

### 3. **`asChild` (Radix slot pattern)**
```tsx
<CopyAddress value="bc1q..." asChild>
  <MyDesignSystemButton variant="ghost">Copier</MyDesignSystemButton>
</CopyAddress>
```
Notre composant **délègue son rendu** à n'importe quel bouton du design system de l'utilisateur, tout en gardant la logique (handler clipboard, feedback visuel).

### 4. **Render props pour la data**
```tsx
<TransactionList txids={[...]}>
  {(tx) => <MyCustomTransactionRow tx={tx} />}
</TransactionList>
```
Composant fournit la logique (fetch, cache, virtualisation), l'utilisateur fournit le rendu.

### 5. **Design tokens via CSS variables**
Notre `@btc-ui/tailwind-preset` expose :
```css
--btc-orange: 32 95% 53%;
--btc-fee-low: ...;
--btc-fee-medium: ...;
--btc-fee-high: ...;
--btc-lightning: 271 78% 50%;
```
Override possible sans recompiler.

### Résultat
**1 composant = 1 implémentation**. Les variantes sont :
- **Sémantique** (data-driven) : `ConfirmationsBadge` change de tone selon `count`.
- **Composition** : l'utilisateur compose les slots.
- **Skin** : CSS variables + asChild.

Pas besoin de livrer `<Balance variant="compact" />`, `<Balance variant="expanded" />`, `<Balance variant="inline" />` — la composition couvre tout.

---

## Progression globale

- Phase 0 (scaffolding + core math) : 0 / surface
- Phase 1 (display MVP) : 0 / 8 composants + 4 hooks
- Phase 2 (inputs) : 0 / 7 composants + 10 hooks
- Phase 3 (wallet & actions) : 0 / 6 composants + 3 hooks
- Phase 4 (flows + viz) : 0 / 14 composants/blocks + 1 hook
- Phase 5 (éducation + avancé) : 0 / 17 composants/blocks + 2 hooks

**Total : 0 / 73 unités livrables (38 composants atomiques + 15 blocks composés + 20 hooks).**
