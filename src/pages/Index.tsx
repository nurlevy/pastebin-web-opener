
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
  const isPastebinUrl = (url: string) => url.includes('pastebin.com');
  const formatPastebinUrl = (url: string) => {
    if (url.includes('pastebin.com/raw/')) return url;
    const match = url.match(/pastebin\.com\/([a-zA-Z0-9]+)/);
    return match && match[1] ? `https://pastebin.com/raw/${match[1]}` : url;
  };

  // Quick open functionality
  const openSavedLink = () => {
    if (savedPastebinUrl) window.open(savedPastebinUrl, "_blank", "noopener,noreferrer");
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
          disabled={!savedPastebinUrl}
          aria-disabled={!savedPastebinUrl}
        >
          <BookOpen className="h-5 w-5" />
          Quick Open
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

  // If user hasn't navigated past the startup screen, render it
  // You can enhance navigation later; for now, main UI is behind "startupScreen"
  return startupScreen;
};

export default Index;
