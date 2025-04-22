
import { useState, useEffect } from "react";
import { Card } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { ExternalLink, Save, BookOpen, Settings as SettingsIcon } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
  DialogDescription,
  DialogTrigger,
} from "@/components/ui/dialog";

// Key for storing the saved URL
const SAVED_PASTE_KEY = "savedPastebinUrl";

const Index = () => {
  const [inputUrl, setInputUrl] = useState("");
  const [extractedLinks, setExtractedLinks] = useState<string[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);
  const [savedPastebinUrl, setSavedPastebinUrl] = useState<string | null>(null);
  const [settingsOpen, setSettingsOpen] = useState(false);
  const { toast } = useToast();

  // On mount, load saved URL
  useEffect(() => {
    const saved = localStorage.getItem(SAVED_PASTE_KEY);
    if (saved) setSavedPastebinUrl(saved);
  }, []);

  // Validate Pastebin URL
  const isPastebinUrl = (url: string) => url.includes("pastebin.com");
  const formatPastebinUrl = (url: string) => {
    if (url.includes("pastebin.com/raw/")) return url;
    const match = url.match(/pastebin\.com\/([a-zA-Z0-9]+)/);
    return match && match[1] ? `https://pastebin.com/raw/${match[1]}` : url;
  };

  // Improved URL extraction function
  const extractUrl = (text: string): string | null => {
    // More comprehensive regex that matches URLs with various protocols and formats
    const urlRegex = /(https?:\/\/(?:www\.|(?!www))[a-zA-Z0-9][a-zA-Z0-9-]+[a-zA-Z0-9]\.[^\s]{2,}|www\.[a-zA-Z0-9][a-zA-Z0-9-]+[a-zA-Z0-9]\.[^\s]{2,}|https?:\/\/(?:www\.|(?!www))[a-zA-Z0-9]+\.[^\s]{2,}|www\.[a-zA-Z0-9]+\.[^\s]{2,})/i;
    
    const match = text.match(urlRegex);
    if (match && match[0]) {
      let url = match[0];
      // Ensure the URL has a protocol
      if (url.startsWith('www.')) {
        url = 'https://' + url;
      }
      return url;
    }
    return null;
  };

  // Updated Quick Open functionality: fetch paste, find URL & open it
  const openSavedLink = async () => {
    if (!savedPastebinUrl) return;
    try {
      setLoading(true);
      const resp = await fetch(savedPastebinUrl);
      if (!resp.ok) throw new Error("Failed to fetch Pastebin content.");
      const text = await resp.text();
      
      console.log("Pastebin content:", text); // Debug: log the content
      
      const url = extractUrl(text);
      if (url) {
        console.log("Found URL:", url); // Debug: log the found URL
        window.open(url, "_blank", "noopener,noreferrer");
      } else {
        console.log("No URL found in content"); // Debug: log when no URL is found
        toast({
          title: "No URL found",
          description: "No valid URL was found in the pastebin. Please check the content format.",
          variant: "destructive",
        });
      }
    } catch (err) {
      console.error("Error fetching pastebin:", err); // Debug: log any errors
      toast({
        title: "Pastebin Fetch Failed",
        description: "Could not load the RAW pastebin or find a URL.",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  // Settings save handler
  const handleSaveUrl = () => {
    if (!inputUrl) {
      toast({ title: "Missing URL", description: "Please enter a URL", variant: "destructive" });
      return;
    }
    if (!isPastebinUrl(inputUrl)) {
      toast({ title: "Invalid URL", description: "Must be a valid pastebin.com URL", variant: "destructive" });
      return;
    }
    const formatted = formatPastebinUrl(inputUrl);
    setSavedPastebinUrl(formatted);
    localStorage.setItem(SAVED_PASTE_KEY, formatted);
    toast({ title: "Saved!", description: "URL has been saved." });
    setSettingsOpen(false);
    setInputUrl("");
  };

  // Show only the quick open/settings window on initial render
  const startupScreen = (
    <div className="min-h-screen flex justify-center items-center bg-gradient-to-b from-blue-50 to-white">
      <Card className="p-8 flex flex-col items-center gap-6 max-w-sm w-full shadow-lg">
        <Button
          className="w-full flex items-center gap-2 text-lg bg-blue-600 hover:bg-blue-700"
          size="lg"
          onClick={openSavedLink}
          disabled={!savedPastebinUrl || loading}
          aria-disabled={!savedPastebinUrl || loading}
        >
          <BookOpen className="h-5 w-5" />
          {loading ? "Opening..." : "Quick Open"}
        </Button>
        <Button
          className="w-full flex items-center gap-2 text-lg"
          size="lg"
          variant="secondary"
          onClick={() => setSettingsOpen(true)}
        >
          <SettingsIcon className="h-5 w-5" />
          Settings
        </Button>
      </Card>
      {/* Settings Dialog */}
      <Dialog open={settingsOpen} onOpenChange={setSettingsOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Edit Quick Open URL</DialogTitle>
            <DialogDescription>
              Enter your pastebin.com URL to enable Quick Open.
            </DialogDescription>
          </DialogHeader>
          <div className="flex flex-col gap-3">
            <Input
              value={inputUrl}
              onChange={(e) => setInputUrl(e.target.value)}
              placeholder="https://pastebin.com/abcdef"
            />
            {savedPastebinUrl && (
              <div>
                <label className="block text-xs mb-1 text-gray-500">Current saved URL</label>
                <Input value={savedPastebinUrl} readOnly className="text-xs" />
              </div>
            )}
          </div>
          <DialogFooter>
            <Button variant="default" onClick={handleSaveUrl}>
              <Save className="h-4 w-4" /> Save
            </Button>
            <Button variant="ghost" onClick={() => setSettingsOpen(false)}>
              Cancel
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );

  return startupScreen;
};

export default Index;
