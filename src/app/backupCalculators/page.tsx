import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { ArrowLeft, FileJson } from 'lucide-react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { DownloadBackupButton } from '@/components/download-backup-button';
import fs from 'fs';
import path from 'path';

// Ensure this page is always rendered dynamically
export const dynamic = 'force-dynamic';
export const revalidate = 0;

interface BackupCalculator {
  name: string;
  slug: string;
  description?: string | null;
  subtitle?: string | null;
  href?: string | null;
  is_active: boolean;
  category?: string;
  subcategory?: string;
  inputs?: any[];
  results?: any[];
  tags?: string[];
  most_used?: boolean;
  popular?: boolean;
  likes?: number;
}

interface BackupData {
  version: string;
  last_updated: string;
  total_calculators: number;
  calculators: BackupCalculator[];
}

async function getBackupData(): Promise<BackupData | null> {
  try {
    // Path to the backup file
    const projectRoot = process.cwd();
    const backupFilePath = path.join(projectRoot, 'data', 'calculators-backup.json');
    
    // Check if file exists
    if (!fs.existsSync(backupFilePath)) {
      return null;
    }
    
    // Read and parse the JSON file
    const fileContent = fs.readFileSync(backupFilePath, 'utf8');
    const backupData: BackupData = JSON.parse(fileContent);
    
    return backupData;
  } catch (error) {
    console.error('Error reading backup file:', error);
    return null;
  }
}

export default async function BackupCalculatorsPage() {
  const backupData = await getBackupData();

  return (
    <div className="container py-12">
      <div className="mb-8">
        <Button variant="ghost" size="icon" asChild className="mb-4">
          <Link href="/">
            <ArrowLeft className="h-6 w-6" />
            <span className="sr-only">Back</span>
          </Link>
        </Button>
        <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
          <div>
            <h1 className="text-4xl font-bold font-headline mb-2">Backup Calculators</h1>
            <p className="text-muted-foreground">
              View the backup JSON file containing all calculators
            </p>
          </div>
          {backupData && (
            <DownloadBackupButton backupData={backupData} />
          )}
        </div>
      </div>

      {!backupData ? (
        <Card>
          <CardContent className="pt-6">
            <div className="text-center py-12">
              <FileJson className="h-12 w-12 mx-auto mb-4 text-muted-foreground" />
              <p className="text-muted-foreground text-lg mb-2">No backup file found</p>
              <p className="text-sm text-muted-foreground">
                The backup file will be created automatically when calculators are added, updated, or deleted.
              </p>
            </div>
          </CardContent>
        </Card>
      ) : (
        <>
          {/* Metadata Card */}
          <Card className="mb-6">
            <CardHeader>
              <div className="flex items-center justify-between">
                <div>
                  <CardTitle>Backup Information</CardTitle>
                  <CardDescription>Metadata about this backup file</CardDescription>
                </div>
                <DownloadBackupButton backupData={backupData} />
              </div>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div>
                  <p className="text-sm text-muted-foreground mb-1">Version</p>
                  <p className="text-lg font-semibold">{backupData.version}</p>
                </div>
                <div>
                  <p className="text-sm text-muted-foreground mb-1">Total Calculators</p>
                  <p className="text-lg font-semibold">{backupData.total_calculators}</p>
                </div>
                <div>
                  <p className="text-sm text-muted-foreground mb-1">Last Updated</p>
                  <p className="text-lg font-semibold">
                    {new Date(backupData.last_updated).toLocaleString()}
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Calculators List */}
          <div className="space-y-4">
            <h2 className="text-2xl font-bold font-headline mb-4">Calculators</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {backupData.calculators.map((calc, index) => (
                <Card key={index} className="hover:shadow-lg transition-shadow">
                  <CardHeader>
                    <div className="flex items-start justify-between">
                      <CardTitle className="text-lg">{calc.name}</CardTitle>
                      <div className="flex gap-1 flex-wrap">
                        {calc.popular && (
                          <Badge variant="default" className="text-xs">Popular</Badge>
                        )}
                        {calc.most_used && (
                          <Badge variant="secondary" className="text-xs">Most Used</Badge>
                        )}
                        {!calc.is_active && (
                          <Badge variant="outline" className="text-xs">Inactive</Badge>
                        )}
                      </div>
                    </div>
                    <CardDescription>
                      {calc.subtitle || calc.description || 'No description available.'}
                    </CardDescription>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-2 text-sm">
                      <div>
                        <span className="text-muted-foreground">Slug: </span>
                        <code className="text-xs bg-muted px-1 py-0.5 rounded">{calc.slug}</code>
                      </div>
                      {calc.category && (
                        <div>
                          <span className="text-muted-foreground">Category: </span>
                          <span className="font-medium">{calc.category}</span>
                        </div>
                      )}
                      {calc.subcategory && (
                        <div>
                          <span className="text-muted-foreground">Subcategory: </span>
                          <span className="font-medium">{calc.subcategory}</span>
                        </div>
                      )}
                      {calc.likes !== undefined && (
                        <div>
                          <span className="text-muted-foreground">Likes: </span>
                          <span className="font-medium">{calc.likes}</span>
                        </div>
                      )}
                      {calc.inputs && calc.inputs.length > 0 && (
                        <div>
                          <span className="text-muted-foreground">Inputs: </span>
                          <span className="font-medium">{calc.inputs.length}</span>
                        </div>
                      )}
                      {calc.results && calc.results.length > 0 && (
                        <div>
                          <span className="text-muted-foreground">Results: </span>
                          <span className="font-medium">{calc.results.length}</span>
                        </div>
                      )}
                      {calc.tags && calc.tags.length > 0 && (
                        <div>
                          <span className="text-muted-foreground">Tags: </span>
                          <div className="flex flex-wrap gap-1 mt-1">
                            {calc.tags.map((tag, tagIndex) => (
                              <Badge key={tagIndex} variant="outline" className="text-xs">
                                {tag}
                              </Badge>
                            ))}
                          </div>
                        </div>
                      )}
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          </div>

        </>
      )}
    </div>
  );
}

