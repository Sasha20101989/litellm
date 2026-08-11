import { Code, CircleAlert, CirclePlay, Info } from "lucide-react";
import { Alert, AlertDescription, AlertTitle } from "@/components/shared/Alert";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Textarea } from "@/components/ui/textarea";
import ModelSelector from "@/components/common_components/ModelSelector";
import { TestResult } from "./semanticFilterTestUtils";
import { useTranslation } from "react-i18next";

interface MCPSemanticFilterTestPanelProps {
  accessToken: string | null;
  testQuery: string;
  setTestQuery: (value: string) => void;
  testModel: string;
  setTestModel: (value: string) => void;
  isTesting: boolean;
  onTest: () => void;
  filterEnabled: boolean;
  testResult: TestResult | null;
  testError: string | null;
  curlCommand: string;
}

export default function MCPSemanticFilterTestPanel({
  accessToken,
  testQuery,
  setTestQuery,
  testModel,
  setTestModel,
  isTesting,
  onTest,
  filterEnabled,
  testResult,
  testError,
  curlCommand,
}: MCPSemanticFilterTestPanelProps) {
  const { t } = useTranslation("gateway");
  const canRunTest = testQuery && testModel && filterEnabled;
  const testDisabled = isTesting || !canRunTest;

  return (
    <Card className="mb-4">
      <CardHeader>
        <CardTitle>{t("mcpServers.semanticFilter.test.title")}</CardTitle>
      </CardHeader>
      <CardContent>
        <Tabs defaultValue="test">
          <TabsList>
            <TabsTrigger value="test" className="flex-none">
              {t("mcpServers.semanticFilter.test.tab")}
            </TabsTrigger>
            <TabsTrigger value="api" className="flex-none">
              {t("mcpServers.semanticFilter.test.apiTab")}
            </TabsTrigger>
          </TabsList>

          <TabsContent value="test">
            <div className="flex w-full flex-col gap-6">
              <div>
                <p className="mb-2 flex items-center gap-1.5 font-medium">
                  <CirclePlay className="size-4" /> {t("mcpServers.semanticFilter.test.query")}
                </p>
                <Textarea
                  className="field-sizing-fixed"
                  placeholder={t("mcpServers.semanticFilter.test.queryPlaceholder")}
                  value={testQuery}
                  onChange={(e) => setTestQuery(e.target.value)}
                  rows={4}
                  disabled={isTesting}
                />
              </div>

              <div>
                <ModelSelector
                  accessToken={accessToken || ""}
                  value={testModel}
                  onChange={setTestModel}
                  disabled={isTesting}
                  showLabel={true}
                  labelText={t("mcpServers.semanticFilter.test.selectModel")}
                />
              </div>

              <Button className="w-full" onClick={onTest} disabled={testDisabled}>
                <CirclePlay />
                {t("mcpServers.semanticFilter.test.run")}
              </Button>

              {!filterEnabled && (
                <Alert>
                  <Info />
                  <AlertTitle>{t("mcpServers.semanticFilter.test.disabledTitle")}</AlertTitle>
                  <AlertDescription>{t("mcpServers.semanticFilter.test.disabledDescription")}</AlertDescription>
                </Alert>
              )}

              {testError && (
                <Alert variant="destructive" className="mb-4">
                  <CircleAlert />
                  <AlertTitle>{t("mcpServers.semanticFilter.test.failedTitle")}</AlertTitle>
                  <AlertDescription>{testError}</AlertDescription>
                </Alert>
              )}

              {testResult && (
                <div>
                  <h5 className="mb-2 text-base font-medium">{t("mcpServers.semanticFilter.test.results")}</h5>
                  <Alert className="mb-4">
                    <Info />
                    <AlertTitle>
                      {t("mcpServers.semanticFilter.test.selectedSummary", {
                        selected: testResult.selectedTools,
                        total: testResult.totalTools,
                      })}
                    </AlertTitle>
                    <AlertDescription>
                      {t("mcpServers.semanticFilter.test.filteredSummary", {
                        count: testResult.totalTools - testResult.selectedTools,
                      })}
                    </AlertDescription>
                  </Alert>
                  <div>
                    <p className="mb-2 block font-medium">{t("mcpServers.semanticFilter.test.selectedTools")}</p>
                    <ul className="m-0 list-disc pl-5">
                      {testResult.tools.map((tool, index) => (
                        <li key={index} className="mb-1">
                          <span>{tool}</span>
                        </li>
                      ))}
                    </ul>
                    {testResult.selectedTools > testResult.tools.length && (
                      <p className="mt-2 block text-sm text-muted-foreground">
                        {t("mcpServers.semanticFilter.test.moreTools", {
                          count: testResult.selectedTools - testResult.tools.length,
                        })}
                      </p>
                    )}
                  </div>
                </div>
              )}
            </div>
          </TabsContent>

          <TabsContent value="api">
            <div>
              <div className="mb-2 flex items-center gap-2">
                <Code className="size-4" />
                <p className="font-medium">{t("mcpServers.semanticFilter.test.apiTab")}</p>
              </div>
              <p className="mb-2 block text-sm text-muted-foreground">
                {t("mcpServers.semanticFilter.test.apiDescription")}
              </p>
              <p className="mb-2 block font-medium">{t("mcpServers.semanticFilter.test.responseHeaders")}</p>
              <ul className="mt-0 mr-0 mb-3 ml-0 list-disc pl-5">
                <li>
                  <span>{t("mcpServers.semanticFilter.test.filterHeader")}</span>
                  <span className="block text-sm text-muted-foreground">
                    {t("mcpServers.semanticFilter.test.example")} 10→3
                  </span>
                </li>
                <li>
                  <span>{t("mcpServers.semanticFilter.test.toolsHeader")}</span>
                  <span className="block text-sm text-muted-foreground">
                    {t("mcpServers.semanticFilter.test.example")} wikipedia-fetch,github-search,slack-post
                  </span>
                </li>
              </ul>
              <pre className="m-0 overflow-auto rounded-sm bg-muted p-3 text-xs">{curlCommand}</pre>
            </div>
          </TabsContent>
        </Tabs>
      </CardContent>
    </Card>
  );
}
