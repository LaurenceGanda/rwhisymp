import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Label } from '@/components/ui/label';
import { Switch } from '@/components/ui/switch';
import { Slider } from '@/components/ui/slider';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Separator } from '@/components/ui/separator';
import { X, Mic, Volume2, Settings } from 'lucide-react';

interface ProcessingOptions {
  noiseSuppressionEnabled: boolean;
  spellingCorrectionEnabled: boolean;
  confidenceThreshold: number;
}

interface SettingsPanelProps {
  options: ProcessingOptions;
  onOptionsChange: (options: ProcessingOptions) => void;
  onClose: () => void;
}

const SettingsPanel = ({ options, onOptionsChange, onClose }: SettingsPanelProps) => {
  const updateOption = <K extends keyof ProcessingOptions>(
    key: K,
    value: ProcessingOptions[K]
  ) => {
    onOptionsChange({ ...options, [key]: value });
  };

  return (
    <Card className="bg-card/95 backdrop-blur-sm border-border/50 shadow-card-custom">
      <div className="p-4 sm:p-6">
        <div className="space-y-4 sm:space-y-6">
          {/* Header */}
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
            <div className="flex items-center gap-3">
              <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-gradient-accent">
                <Settings className="h-4 w-4 text-primary" />
              </div>
              <h3 className="text-base sm:text-lg font-semibold text-foreground">Audio Processing Settings</h3>
            </div>
            <Button
              variant="ghost"
              size="sm"
              onClick={onClose}
              className="text-muted-foreground hover:text-foreground self-end sm:self-auto"
            >
              <X className="h-4 w-4" />
            </Button>
          </div>

          <Separator className="bg-border/50" />

          <div className="grid gap-4 sm:gap-6 xl:grid-cols-2">
            {/* Audio Input Settings */}
            <div className="space-y-4">
              <div className="flex items-center gap-2">
                <Mic className="h-4 w-4 text-primary" />
                <h4 className="font-medium text-foreground">Audio Input</h4>
              </div>

              <div className="space-y-4">
                <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2">
                  <div>
                    <Label htmlFor="noise-suppression" className="text-sm font-medium">
                      Noise Suppression (RNNoise)
                    </Label>
                    <p className="text-xs text-muted-foreground mt-1">
                      Uses RNNoise to reduce background noise and improve speech clarity
                    </p>
                  </div>
                  <Switch
                    id="noise-suppression"
                    checked={options.noiseSuppressionEnabled}
                    onCheckedChange={(checked) => updateOption('noiseSuppressionEnabled', checked)}
                  />
                </div>

                <div className="space-y-2">
                  <Label className="text-sm font-medium">Audio Quality</Label>
                  <Select defaultValue="high">
                    <SelectTrigger className="w-full">
                      <SelectValue placeholder="Select quality" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="low">Low (16kHz)</SelectItem>
                      <SelectItem value="medium">Medium (22kHz)</SelectItem>
                      <SelectItem value="high">High (44kHz)</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>
            </div>

            {/* Processing Settings */}
            <div className="space-y-4">
              <div className="flex items-center gap-2">
                <Volume2 className="h-4 w-4 text-primary" />
                <h4 className="font-medium text-foreground">Text Processing</h4>
              </div>

              <div className="space-y-4">
                <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2">
                  <div>
                    <Label htmlFor="spelling-correction" className="text-sm font-medium">
                      Spelling Correction (SymSpell)
                    </Label>
                    <p className="text-xs text-muted-foreground mt-1">
                      Automatically corrects spelling errors in the transcription
                    </p>
                  </div>
                  <Switch
                    id="spelling-correction"
                    checked={options.spellingCorrectionEnabled}
                    onCheckedChange={(checked) => updateOption('spellingCorrectionEnabled', checked)}
                  />
                </div>

                <div className="space-y-2">
                  <Label className="text-sm font-medium">
                    Confidence Threshold: {Math.round(options.confidenceThreshold * 100)}%
                  </Label>
                  <Slider
                    value={[options.confidenceThreshold]}
                    onValueChange={(value) => updateOption('confidenceThreshold', value[0])}
                    max={1}
                    min={0.1}
                    step={0.05}
                    className="w-full"
                  />
                  <p className="text-xs text-muted-foreground">
                    Minimum confidence level for accepting transcribed words
                  </p>
                </div>

                <div className="space-y-2">
                  <Label className="text-sm font-medium">Language Model</Label>
                  <Select defaultValue="en">
                    <SelectTrigger className="w-full">
                      <SelectValue placeholder="Select language" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="en">English</SelectItem>
                      <SelectItem value="es">Spanish</SelectItem>
                      <SelectItem value="fr">French</SelectItem>
                      <SelectItem value="de">German</SelectItem>
                      <SelectItem value="it">Italian</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>
            </div>
          </div>

          <Separator className="bg-border/50" />

          {/* Advanced Features */}
          <div className="space-y-4">
            <h4 className="font-medium text-foreground">Advanced Features</h4>
            
            <div className="grid gap-3 sm:gap-4 grid-cols-1 sm:grid-cols-2">
              <div className="flex items-center justify-between p-2 rounded-lg bg-gradient-accent border border-border/30">
                <Label htmlFor="dtw-alignment" className="text-sm font-medium">
                  Dynamic Time Warping
                </Label>
                <Switch id="dtw-alignment" defaultChecked />
              </div>
              
              <div className="flex items-center justify-between p-2 rounded-lg bg-gradient-accent border border-border/30">
                <Label htmlFor="real-time" className="text-sm font-medium">
                  Real-time Processing
                </Label>
                <Switch id="real-time" defaultChecked />
              </div>
              
              <div className="flex items-center justify-between p-2 rounded-lg bg-gradient-accent border border-border/30">
                <Label htmlFor="punctuation" className="text-sm font-medium">
                  Auto Punctuation
                </Label>
                <Switch id="punctuation" defaultChecked />
              </div>
              
              <div className="flex items-center justify-between p-2 rounded-lg bg-gradient-accent border border-border/30">
                <Label htmlFor="speaker-detection" className="text-sm font-medium">
                  Speaker Detection
                </Label>
                <Switch id="speaker-detection" />
              </div>
            </div>
          </div>

          <Separator className="bg-border/50" />

          {/* Reset Button */}
          <div className="flex justify-center sm:justify-end">
            <Button
              variant="outline"
              onClick={() => {
                onOptionsChange({
                  noiseSuppressionEnabled: true,
                  spellingCorrectionEnabled: true,
                  confidenceThreshold: 0.7
                });
              }}
              className="border-border/50 w-full sm:w-auto"
            >
              Reset to Defaults
            </Button>
          </div>
        </div>
      </div>
    </Card>
  );
};

export default SettingsPanel;