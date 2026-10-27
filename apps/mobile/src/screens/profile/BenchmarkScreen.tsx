/* eslint-disable no-console */
/**
 * DEV ONLY — AI Scan Benchmark Screen
 * Remove before production release.
 */
import { useState } from "react";
import {
  ActivityIndicator,
  Image,
  Pressable,
  ScrollView,
  Text,
  View,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { useRouter } from "expo-router";
import {
  AlertCircle,
  CheckCircle,
  ChevronLeft,
  Download,
  FileText,
  Play,
  Terminal,
  XCircle,
} from "lucide-react-native";
import { File, Paths } from "expo-file-system";
import * as Sharing from "expo-sharing";
import { colors, spacing } from "@/constants/theme";
import { aiScanService } from "@/services";

const SUPABASE_URL = "https://ghmreektlnoudsshzkcx.supabase.co";
const STORAGE_BASE = `${SUPABASE_URL}/storage/v1/object/public/benchmark`;

type GroundTruth = {
  image: string;
  expected: {
    name: string;
    tcgType: "pokemon" | "yugioh" | "magic";
    cardNumber: string | null;
    setName: string;
    passcode: string | null;
    scryfallId: string | null;
  };
  notes?: string;
};

type CheckResult = {
  name: boolean;
  tcgType: boolean;
  cardNumber: boolean;
  setName: boolean;
  passcode: boolean;
  scryfallId: boolean;
};

type CardResult = {
  image: string;
  expectedName: string;
  actualName: string | null;
  expected: GroundTruth["expected"];
  actual: Record<string, string | null> | null;
  score: number;
  checks: CheckResult;
  error: string | null;
  latencyMs: number;
};

const GROUND_TRUTH: GroundTruth[] = [
  {
    image: "p01.png",
    expected: {
      name: "Charizard VMAX",
      tcgType: "pokemon",
      cardNumber: "020/189",
      setName: "Darkness Ablaze",
      passcode: null,
      scryfallId: null,
    },
    notes: "VMAX suffix check",
  },
  {
    image: "p02.png",
    expected: {
      name: "Pikachu",
      tcgType: "pokemon",
      cardNumber: "005/025",
      setName: "Celebrations",
      passcode: null,
      scryfallId: null,
    },
    notes: "Celebrations 25th logo",
  },
  {
    image: "p03.png",
    expected: {
      name: "Mewtwo-GX",
      tcgType: "pokemon",
      cardNumber: "76/73",
      setName: "Shining Legends",
      passcode: null,
      scryfallId: null,
    },
    notes: "Secret rare numbering",
  },
  {
    image: "p04.png",
    expected: {
      name: "Arceus VSTAR",
      tcgType: "pokemon",
      cardNumber: "123/172",
      setName: "Brilliant Stars",
      passcode: null,
      scryfallId: null,
    },
    notes: "VSTAR suffix check",
  },
  {
    image: "p05.png",
    expected: {
      name: "Umbreon VMAX",
      tcgType: "pokemon",
      cardNumber: "215/203",
      setName: "Evolving Skies",
      passcode: null,
      scryfallId: null,
    },
    notes: "Alternate Art VMAX",
  },
  {
    image: "p06.png",
    expected: {
      name: "Rayquaza V",
      tcgType: "pokemon",
      cardNumber: "194/203",
      setName: "Evolving Skies",
      passcode: null,
      scryfallId: null,
    },
    notes: "Full Art V",
  },
  {
    image: "p07.png",
    expected: {
      name: "Gengar VMAX",
      tcgType: "pokemon",
      cardNumber: "271/264",
      setName: "Fusion Strike",
      passcode: null,
      scryfallId: null,
    },
    notes: "Alternate Art VMAX Gengar",
  },
  {
    image: "p08.png",
    expected: {
      name: "Lugia V",
      tcgType: "pokemon",
      cardNumber: "186/195",
      setName: "Silver Tempest",
      passcode: null,
      scryfallId: null,
    },
    notes: "Full Art Lugia",
  },
  {
    image: "p09.png",
    expected: {
      name: "Giratina V",
      tcgType: "pokemon",
      cardNumber: "186/196",
      setName: "Lost Origin",
      passcode: null,
      scryfallId: null,
    },
    notes: "Complex Alternate Art Giratina",
  },
  {
    image: "p10.png",
    expected: {
      name: "Blastoise",
      tcgType: "pokemon",
      cardNumber: "2/102",
      setName: "Base Set",
      passcode: null,
      scryfallId: null,
    },
    notes: "Classic Base Set Blastoise",
  },
  {
    image: "y01.png",
    expected: {
      name: "Blue-Eyes White Dragon",
      tcgType: "yugioh",
      cardNumber: "LOB-001",
      setName: "Legend of Blue Eyes",
      passcode: "89631139",
      scryfallId: null,
    },
    notes: "LOB set code",
  },
  {
    image: "y02.png",
    expected: {
      name: "Dark Magician Girl",
      tcgType: "yugioh",
      cardNumber: "MFC-000",
      setName: "Magician's Force",
      passcode: "38033121",
      scryfallId: null,
    },
    notes: "Secret Rare 000",
  },
  {
    image: "y03.png",
    expected: {
      name: "Exodia the Forbidden One",
      tcgType: "yugioh",
      cardNumber: "LOB-024",
      setName: "Legend of Blue Eyes",
      passcode: "33396948",
      scryfallId: null,
    },
    notes: "Classic Exodia piece",
  },
  {
    image: "y04.png",
    expected: {
      name: "Time Wizard",
      tcgType: "yugioh",
      cardNumber: "MRD-065",
      setName: "Metal Raiders",
      passcode: "71625222",
      scryfallId: null,
    },
    notes: "MRD set code",
  },
  {
    image: "y05.png",
    expected: {
      name: "Raigeki",
      tcgType: "yugioh",
      cardNumber: "TN19-IT010",
      setName: "2019 Gold Sarcophagus Tin",
      passcode: "12580477",
      scryfallId: null,
    },
    notes: "Italian print — TN19-IT010",
  },
  {
    image: "y06.png",
    expected: {
      name: "Stardust Dragon",
      tcgType: "yugioh",
      cardNumber: "TDGS-EN040",
      setName: "The Duelist Genesis",
      passcode: "44508094",
      scryfallId: null,
    },
    notes: "5D era set code",
  },
  {
    image: "y07.png",
    expected: {
      name: "Pot of Greed",
      tcgType: "yugioh",
      cardNumber: "LOB-119",
      setName: "Legend of Blue Eyes White Dragon",
      passcode: "55144522",
      scryfallId: null,
    },
    notes: "LOB 1st Edition",
  },
  {
    image: "y08.png",
    expected: {
      name: "Jinzo",
      tcgType: "yugioh",
      cardNumber: "PSV-000",
      setName: "Pharaoh's Servant",
      passcode: "77585513",
      scryfallId: null,
    },
    notes: "PSV set code",
  },
  {
    image: "y09.png",
    expected: {
      name: "Slifer the Sky Dragon",
      tcgType: "yugioh",
      cardNumber: "GBI-001",
      setName: "Gameboy International Promo",
      passcode: null,
      scryfallId: null,
    },
    notes: "No passcode check",
  },
  {
    image: "y10.png",
    expected: {
      name: "Ash Blossom & Joyous Spring",
      tcgType: "yugioh",
      cardNumber: "MACR-EN036",
      setName: "Maximum Crisis",
      passcode: "14558127",
      scryfallId: null,
    },
    notes: "Modern staple card",
  },
  {
    image: "m01.png",
    expected: {
      name: "Counterspell",
      tcgType: "magic",
      cardNumber: "54",
      setName: "Revised Edition",
      passcode: null,
      scryfallId: "3ed/54",
    },
    notes: "Revised Edition — white border, no set code",
  },
  {
    image: "m02.png",
    expected: {
      name: "Sol Ring",
      tcgType: "magic",
      cardNumber: "871",
      setName: "Commander Legends: Battle for Baldur's Gate",
      passcode: null,
      scryfallId: "clb/871",
    },
    notes: "CLB set, not MIC",
  },
  {
    image: "m03.png",
    expected: {
      name: "Ragavan, Nimble Pilferer",
      tcgType: "magic",
      cardNumber: "138",
      setName: "Modern Horizons 2",
      passcode: null,
      scryfallId: "mh2/138",
    },
    notes: "MH2 check",
  },
  {
    image: "m04.png",
    expected: {
      name: "Teferi, Time Raveler",
      tcgType: "magic",
      cardNumber: "221",
      setName: "War of the Spark",
      passcode: null,
      scryfallId: "war/221",
    },
    notes: "Planeswalker check",
  },
  {
    image: "m05.png",
    expected: {
      name: "Lightning Bolt",
      tcgType: "magic",
      cardNumber: "146",
      setName: "Magic 2010",
      passcode: null,
      scryfallId: "m10/146",
    },
    notes: "M10 set, not Revised",
  },
  {
    image: "m06.png",
    expected: {
      name: "Orcish Bowmasters",
      tcgType: "magic",
      cardNumber: "433",
      setName: "The Lord of the Rings: Tales of Middle-earth",
      passcode: null,
      scryfallId: "ltr/433",
    },
    notes: "Borderless LTR",
  },
  {
    image: "m07.png",
    expected: {
      name: "Sheoldred, the Apocalypse",
      tcgType: "magic",
      cardNumber: "107",
      setName: "Dominaria United",
      passcode: null,
      scryfallId: "dmu/107",
    },
    notes: "DMU set check",
  },
  {
    image: "m08.png",
    expected: {
      name: "The One Ring",
      tcgType: "magic",
      cardNumber: "451",
      setName: "The Lord of the Rings: Tales of Middle-earth",
      passcode: null,
      scryfallId: "ltr/451",
    },
    notes: "Bundle Promo art",
  },
  {
    image: "m09.png",
    expected: {
      name: "Birds of Paradise",
      tcgType: "magic",
      cardNumber: "151",
      setName: "Dominaria Remastered",
      passcode: null,
      scryfallId: "dmr/151",
    },
    notes: "DMR set — AI was correct, GT was wrong",
  },
  {
    image: "m10.png",
    expected: {
      name: "Urza's Saga",
      tcgType: "magic",
      cardNumber: "259",
      setName: "Modern Horizons 2",
      passcode: null,
      scryfallId: "mh2/259",
    },
    notes: "MH2 Saga",
  },
];

function namesMatch(a: string, b: string): boolean {
  const clean = (s: string) =>
    s
      .toLowerCase()
      .trim()
      .replace(/[^a-z0-9\s]/g, "");
  return (
    clean(a) === clean(b) || clean(a).includes(clean(b)) || clean(b).includes(clean(a))
  );
}

function cleanNumber(n: string): string {
  return n.split("/")[0].replace(/^0+/, "");
}

function numbersMatch(a: string | null, b: string | null): boolean {
  if (!a || !b) return false;
  return cleanNumber(a) === cleanNumber(b);
}

function setNamesMatch(a: string | null, b: string | null): boolean {
  if (!a || !b) return false;
  const words = (s: string) =>
    s
      .toLowerCase()
      .split(/[\s:,]+/)
      .filter((w) => w.length > 2);
  const wordsA = words(a);
  const wordsB = words(b);
  return wordsA.some((wa) => wordsB.some((wb) => wa.includes(wb) || wb.includes(wa)));
}

async function imageUrlToBase64(url: string): Promise<string> {
  const res = await fetch(url);
  const blob = await res.blob();
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onloadend = () => {
      const result = reader.result as string;
      resolve(result.split(",")[1]);
    };
    reader.onerror = reject;
    reader.readAsDataURL(blob);
  });
}

export default function BenchmarkScreen() {
  const router = useRouter();
  const [running, setRunning] = useState(false);
  const [progress, setProgress] = useState(0);
  const [results, setResults] = useState<CardResult[]>([]);
  const [done, setDone] = useState(false);
  const [expandedImage, setExpandedImage] = useState<string | null>(null);

  const runBenchmark = async () => {
    setRunning(true);
    setDone(false);
    setResults([]);
    setProgress(0);

    const cardResults: CardResult[] = [];

    for (let i = 0; i < GROUND_TRUTH.length; i++) {
      const entry = GROUND_TRUTH[i];
      const imageUrl = `${STORAGE_BASE}/${entry.image}`;
      const start = Date.now();
      let actualName: string | null = null;
      let actualData: Record<string, string | null> | null = null;
      let error: string | null = null;
      let checks: CheckResult = {
        name: false,
        tcgType: false,
        cardNumber: false,
        setName: false,
        passcode: false,
        scryfallId: false,
      };

      try {
        const base64 = await imageUrlToBase64(imageUrl);
        const result = await aiScanService.recognizeCard(base64);
        actualName = result.name || null;
        actualData = {
          name: result.name || null,
          tcgType: result.tcgType || null,
          cardNumber: result.number || null,
          setName: result.set || null,
          passcode: result.passcode ?? null,
          scryfallId: result.scryfallId ?? null,
        };
        checks = {
          name: namesMatch(result.name ?? "", entry.expected.name),
          tcgType: result.tcgType === entry.expected.tcgType,
          cardNumber: numbersMatch(result.number, entry.expected.cardNumber),
          setName: setNamesMatch(result.set, entry.expected.setName),
          passcode: (result.passcode ?? null) === entry.expected.passcode,
          scryfallId: (result.scryfallId ?? null) === entry.expected.scryfallId,
        };
      } catch (err) {
        error = String(err);
      }

      const score = Object.values(checks).filter(Boolean).length;
      cardResults.push({
        image: entry.image,
        expectedName: entry.expected.name,
        actualName,
        expected: entry.expected,
        actual: actualData,
        score,
        checks,
        error,
        latencyMs: Date.now() - start,
      });

      setProgress(i + 1);
      setResults([...cardResults]);

      if (i < GROUND_TRUTH.length - 1) {
        await new Promise((r) => setTimeout(r, 300));
      }
    }

    setRunning(false);
    setDone(true);
  };

  const total = results.length;
  const perfect = results.filter((r) => r.score === 6).length;
  const partial = results.filter((r) => r.score >= 4 && r.score < 6).length;
  const errors = results.filter((r) => r.error !== null).length;
  const nameAcc =
    total > 0
      ? Math.round((results.filter((r) => r.checks.name).length / total) * 100)
      : 0;

  const logJson = () => {
    const summary = {
      total,
      perfect,
      partial,
      errors,
      nameAcc,
      date: new Date().toISOString(),
    };
    console.log("=== BENCHMARK JSON ===");
    console.log(JSON.stringify({ summary, results }, null, 2));
    console.log("=== END BENCHMARK JSON ===");
  };

  const downloadJson = async () => {
    const summary = {
      total,
      perfect,
      partial,
      errors,
      nameAcc,
      date: new Date().toISOString(),
    };
    const json = JSON.stringify({ summary, results }, null, 2);
    const filename = `benchmark-${new Date().toISOString().split("T")[0]}.json`;
    const file = new File(Paths.cache, filename);
    file.write(json);
    await Sharing.shareAsync(file.uri, {
      mimeType: "application/json",
      dialogTitle: "Benchmark JSON speichern",
    });
  };

  const logCsv = () => {
    const header =
      "image,expectedName,actualName,score,name,tcgType,cardNumber,setName,passcode,scryfallId,latencyMs,error";
    const rows = results.map((r) =>
      [
        r.image,
        `"${r.expectedName}"`,
        `"${r.actualName ?? ""}"`,
        r.score,
        r.checks.name ? 1 : 0,
        r.checks.tcgType ? 1 : 0,
        r.checks.cardNumber ? 1 : 0,
        r.checks.setName ? 1 : 0,
        r.checks.passcode ? 1 : 0,
        r.checks.scryfallId ? 1 : 0,
        r.latencyMs,
        `"${r.error ?? ""}"`,
      ].join(","),
    );
    console.log("=== BENCHMARK CSV ===");
    console.log([header, ...rows].join("\n"));
    console.log("=== END BENCHMARK CSV ===");
  };

  return (
    <SafeAreaView
      style={{ flex: 1, backgroundColor: colors.background.primary }}
      edges={["top"]}
    >
      {/* Header */}
      <View
        style={{
          flexDirection: "row",
          alignItems: "center",
          paddingHorizontal: spacing.lg,
          paddingVertical: spacing.md,
          gap: spacing.sm,
        }}
      >
        <Pressable onPress={() => router.back()} hitSlop={12}>
          <ChevronLeft size={24} color={colors.text.primary} />
        </Pressable>
        <Text
          style={{
            fontFamily: "PlusJakartaSans_700Bold",
            fontSize: 20,
            color: colors.text.primary,
          }}
        >
          [DEV] AI Scan Benchmark
        </Text>
      </View>

      <ScrollView
        style={{ flex: 1, paddingHorizontal: spacing.lg }}
        contentContainerStyle={{ paddingBottom: 40 }}
      >
        {/* Start Button */}
        {!running && (
          <Pressable
            testID="benchmark-run-btn"
            onPress={runBenchmark}
            style={{
              backgroundColor: colors.primary.DEFAULT,
              borderRadius: 12,
              padding: spacing.md,
              alignItems: "center",
              marginBottom: spacing.lg,
            }}
          >
            <View style={{ flexDirection: "row", alignItems: "center", gap: 8 }}>
              <Play size={18} color="#fff" />
              <Text
                style={{
                  color: "#fff",
                  fontFamily: "PlusJakartaSans_700Bold",
                  fontSize: 16,
                }}
              >
                Benchmark starten ({GROUND_TRUTH.length} Karten)
              </Text>
            </View>
          </Pressable>
        )}

        {/* Progress */}
        {running && (
          <View
            style={{ alignItems: "center", marginBottom: spacing.lg, gap: spacing.sm }}
          >
            <ActivityIndicator color={colors.primary.DEFAULT} />
            <Text
              style={{
                color: colors.text.secondary,
                fontFamily: "PlusJakartaSans_400Regular",
              }}
            >
              {progress}/{GROUND_TRUTH.length} — {GROUND_TRUTH[progress - 1]?.image ?? ""}
            </Text>
            <View
              style={{
                width: "100%",
                height: 6,
                backgroundColor: colors.background.tertiary,
                borderRadius: 4,
              }}
            >
              <View
                style={{
                  width: `${(progress / GROUND_TRUTH.length) * 100}%`,
                  height: 6,
                  backgroundColor: colors.primary.DEFAULT,
                  borderRadius: 4,
                }}
              />
            </View>
          </View>
        )}

        {/* Summary */}
        {done && total > 0 && (
          <View
            style={{
              backgroundColor: colors.background.secondary,
              borderRadius: 12,
              padding: spacing.md,
              marginBottom: spacing.lg,
              gap: spacing.sm,
            }}
          >
            <Text
              style={{
                fontFamily: "PlusJakartaSans_700Bold",
                fontSize: 16,
                color: colors.text.primary,
              }}
            >
              Ergebnis
            </Text>
            <Text
              style={{
                color: colors.text.secondary,
                fontFamily: "PlusJakartaSans_400Regular",
              }}
            >
              ✅ Perfect (6/6): {perfect} ({Math.round((perfect / total) * 100)}%)
            </Text>
            <Text
              style={{
                color: colors.text.secondary,
                fontFamily: "PlusJakartaSans_400Regular",
              }}
            >
              🟡 Partial (4-5): {partial} ({Math.round((partial / total) * 100)}%)
            </Text>
            <Text
              style={{
                color: colors.text.secondary,
                fontFamily: "PlusJakartaSans_400Regular",
              }}
            >
              ❌ Errors: {errors}
            </Text>
            <Text
              style={{
                color: colors.text.secondary,
                fontFamily: "PlusJakartaSans_400Regular",
              }}
            >
              Name Accuracy: {nameAcc}%
            </Text>
            <View
              style={{ flexDirection: "row", gap: spacing.sm, marginTop: spacing.xs }}
            >
              <Pressable
                onPress={logJson}
                style={{
                  flex: 1,
                  flexDirection: "row",
                  alignItems: "center",
                  justifyContent: "center",
                  gap: 6,
                  backgroundColor: colors.background.tertiary,
                  borderRadius: 8,
                  padding: spacing.sm,
                }}
              >
                <Terminal size={14} color={colors.text.secondary} />
                <Text
                  style={{
                    color: colors.text.secondary,
                    fontFamily: "PlusJakartaSans_600SemiBold",
                    fontSize: 13,
                  }}
                >
                  Log JSON
                </Text>
              </Pressable>
              <Pressable
                onPress={logCsv}
                style={{
                  flex: 1,
                  flexDirection: "row",
                  alignItems: "center",
                  justifyContent: "center",
                  gap: 6,
                  backgroundColor: colors.background.tertiary,
                  borderRadius: 8,
                  padding: spacing.sm,
                }}
              >
                <FileText size={14} color={colors.text.secondary} />
                <Text
                  style={{
                    color: colors.text.secondary,
                    fontFamily: "PlusJakartaSans_600SemiBold",
                    fontSize: 13,
                  }}
                >
                  Log CSV
                </Text>
              </Pressable>
            </View>
            <Pressable
              onPress={downloadJson}
              style={{
                flexDirection: "row",
                alignItems: "center",
                justifyContent: "center",
                gap: 6,
                backgroundColor: colors.primary.DEFAULT,
                borderRadius: 8,
                padding: spacing.sm,
                marginTop: spacing.xs,
              }}
            >
              <Download size={14} color="#fff" />
              <Text
                style={{
                  color: "#fff",
                  fontFamily: "PlusJakartaSans_600SemiBold",
                  fontSize: 13,
                }}
              >
                Download JSON
              </Text>
            </Pressable>
          </View>
        )}

        {/* Per-card results */}
        {results.map((r) => (
          <Pressable
            key={r.image}
            onPress={() => setExpandedImage(expandedImage === r.image ? null : r.image)}
            style={{
              backgroundColor: colors.background.secondary,
              borderRadius: 10,
              padding: spacing.sm,
              marginBottom: spacing.xs,
              gap: 4,
            }}
          >
            {/* Header row */}
            <View style={{ flexDirection: "row", alignItems: "center", gap: spacing.sm }}>
              {r.error ? (
                <AlertCircle size={18} color={colors.danger.DEFAULT} />
              ) : r.score === 6 ? (
                <CheckCircle size={18} color={colors.success.DEFAULT} />
              ) : r.score >= 4 ? (
                <AlertCircle size={18} color={colors.warning.DEFAULT} />
              ) : (
                <XCircle size={18} color={colors.danger.DEFAULT} />
              )}
              <Text
                style={{
                  flex: 1,
                  color: colors.text.primary,
                  fontFamily: "PlusJakartaSans_600SemiBold",
                  fontSize: 13,
                }}
              >
                {r.image} — {r.expectedName}
              </Text>
              <Text
                style={{
                  color: colors.text.muted,
                  fontFamily: "PlusJakartaSans_400Regular",
                  fontSize: 12,
                }}
              >
                {r.score}/6 · {r.latencyMs}ms
              </Text>
            </View>

            {/* Error */}
            {r.error && (
              <Text
                style={{
                  color: colors.danger.DEFAULT,
                  fontFamily: "PlusJakartaSans_400Regular",
                  fontSize: 11,
                  marginLeft: 26,
                }}
              >
                ERROR: {r.error.slice(0, 120)}
              </Text>
            )}

            {/* Field logs — only show failed fields */}
            {!r.error && r.actual && (
              <View style={{ marginLeft: 26, gap: 2 }}>
                {!r.checks.name && (
                  <Text
                    style={{
                      color: colors.warning.DEFAULT,
                      fontFamily: "PlusJakartaSans_400Regular",
                      fontSize: 11,
                    }}
                  >
                    name: "{r.actual.name}" ≠ "{r.expected.name}"
                  </Text>
                )}
                {!r.checks.tcgType && (
                  <Text
                    style={{
                      color: colors.warning.DEFAULT,
                      fontFamily: "PlusJakartaSans_400Regular",
                      fontSize: 11,
                    }}
                  >
                    tcgType: "{r.actual.tcgType}" ≠ "{r.expected.tcgType}"
                  </Text>
                )}
                {!r.checks.cardNumber && r.expected.cardNumber && (
                  <Text
                    style={{
                      color: colors.warning.DEFAULT,
                      fontFamily: "PlusJakartaSans_400Regular",
                      fontSize: 11,
                    }}
                  >
                    cardNumber: "{r.actual.cardNumber}" ≠ "{r.expected.cardNumber}"
                  </Text>
                )}
                {!r.checks.setName && (
                  <Text
                    style={{
                      color: colors.warning.DEFAULT,
                      fontFamily: "PlusJakartaSans_400Regular",
                      fontSize: 11,
                    }}
                  >
                    setName: "{r.actual.setName}" ≠ "{r.expected.setName}"
                  </Text>
                )}
                {!r.checks.passcode && r.expected.passcode && (
                  <Text
                    style={{
                      color: colors.warning.DEFAULT,
                      fontFamily: "PlusJakartaSans_400Regular",
                      fontSize: 11,
                    }}
                  >
                    passcode: "{r.actual.passcode}" ≠ "{r.expected.passcode}"
                  </Text>
                )}
                {!r.checks.scryfallId && r.expected.scryfallId && (
                  <Text
                    style={{
                      color: colors.warning.DEFAULT,
                      fontFamily: "PlusJakartaSans_400Regular",
                      fontSize: 11,
                    }}
                  >
                    scryfallId: "{r.actual.scryfallId}" ≠ "{r.expected.scryfallId}"
                  </Text>
                )}
              </View>
            )}

            {/* Expanded: split view — left AI result, right original image */}
            {expandedImage === r.image && (
              <View
                style={{ flexDirection: "row", gap: spacing.sm, marginTop: spacing.xs }}
              >
                {/* Left: AI fields */}
                <View
                  style={{
                    flex: 1,
                    backgroundColor: colors.background.tertiary,
                    borderRadius: 8,
                    padding: spacing.xs,
                    gap: 2,
                  }}
                >
                  <Text
                    style={{
                      color: colors.text.muted,
                      fontFamily: "PlusJakartaSans_600SemiBold",
                      fontSize: 10,
                      marginBottom: 2,
                    }}
                  >
                    AI ERGEBNIS
                  </Text>
                  {(
                    [
                      "name",
                      "tcgType",
                      "cardNumber",
                      "setName",
                      "passcode",
                      "scryfallId",
                    ] as const
                  ).map((field) => (
                    <Text
                      key={field}
                      style={{
                        fontFamily: "PlusJakartaSans_400Regular",
                        fontSize: 10,
                        color: r.checks[field]
                          ? colors.success.DEFAULT
                          : colors.warning.DEFAULT,
                      }}
                    >
                      {field}: {r.actual?.[field] ?? "null"}
                    </Text>
                  ))}
                </View>
                {/* Right: original image from storage */}
                <Image
                  source={{ uri: `${STORAGE_BASE}/${r.image}` }}
                  style={{ width: 110, height: 155, borderRadius: 6 }}
                  resizeMode="contain"
                />
              </View>
            )}
          </Pressable>
        ))}
      </ScrollView>
    </SafeAreaView>
  );
}
