import NotificationManager from "@/components/molecules/notifications_manager";
import { testMCPSemanticFilter } from "@/components/networking";

export interface TestResult {
  totalTools: number;
  selectedTools: number;
  tools: string[];
}

interface SemanticFilterTestMessages {
  missingInput: string;
  notEnabled: string;
  completed: string;
  failed: string;
}

const DEFAULT_MESSAGES: SemanticFilterTestMessages = {
  missingInput: "Please enter a query and select a model",
  notEnabled: "Semantic filter is not enabled or no tools were filtered",
  completed: "Semantic filter test completed successfully",
  failed: "Failed to test semantic filter",
};

interface FilterHeaders {
  filter: string | null;
  tools: string | null;
}

const parseFilterHeaders = (headers: FilterHeaders): TestResult | null => {
  if (!headers.filter) {
    return null;
  }

  const [total, selected] = headers.filter.split("->").map(Number);
  const tools = headers.tools ? headers.tools.split(",").map((name) => name.trim()) : [];

  return { totalTools: total, selectedTools: selected, tools };
};

export const runSemanticFilterTest = async ({
  accessToken,
  testModel,
  testQuery,
  setIsTesting,
  setTestResult,
  setTestError,
  messages = DEFAULT_MESSAGES,
}: {
  accessToken: string;
  testModel: string;
  testQuery: string;
  setIsTesting: (value: boolean) => void;
  setTestResult: (result: TestResult | null) => void;
  setTestError: (error: string | null) => void;
  messages?: SemanticFilterTestMessages;
}) => {
  if (!testQuery || !testModel || !accessToken) {
    NotificationManager.error(messages.missingInput);
    return;
  }

  setIsTesting(true);
  setTestResult(null);
  setTestError(null);

  try {
    const { headers } = await testMCPSemanticFilter(accessToken, testModel, testQuery);
    const parsedResult = parseFilterHeaders(headers);

    if (!parsedResult) {
      NotificationManager.warning(messages.notEnabled);
      return;
    }

    setTestResult(parsedResult);
    NotificationManager.success(messages.completed);
  } catch (error) {
    console.error("Test failed:", error);
    const message = error instanceof Error && error.message ? error.message : messages.failed;
    setTestError(message);
    NotificationManager.error(messages.failed);
  } finally {
    setIsTesting(false);
  }
};

export const getCurlCommand = (testModel: string, testQuery: string, queryFallback = "Your query here") =>
  `curl --location 'http://localhost:4000/v1/responses' \\
--header 'Content-Type: application/json' \\
--header 'Authorization: Bearer sk-1234' \\
--data '{
    "model": "${testModel}",
    "input": [
    {
      "role": "user",
      "content": "${testQuery || queryFallback}",
      "type": "message"
    }
  ],
    "tools": [
        {
            "type": "mcp",
            "server_url": "litellm_proxy",
            "require_approval": "never"
        }
    ],
    "tool_choice": "required"
}'`;
