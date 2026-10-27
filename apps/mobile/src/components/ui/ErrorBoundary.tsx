import { Component } from "react";
import { Pressable, Text, View } from "react-native";
import type { ErrorInfo, ReactNode } from "react";
import i18next from "i18next";
import { logger } from "@/utils/Logger";

type Props = {
  children: ReactNode;
  fallback?: ReactNode;
};

type State = {
  hasError: boolean;
  error: Error | null;
};

export class ErrorBoundary extends Component<Props, State> {
  constructor(props: Props) {
    super(props);
    this.state = { hasError: false, error: null };
  }

  static getDerivedStateFromError(error: Error): State {
    return { hasError: true, error };
  }

  componentDidCatch(error: Error, errorInfo: ErrorInfo) {
    logger.error("ErrorBoundary", "Uncaught error", { error: error.message, stack: errorInfo.componentStack });
  }

  handleReset = () => {
    this.setState({ hasError: false, error: null });
  };

  render() {
    if (this.state.hasError) {
      if (this.props.fallback) {
        return this.props.fallback;
      }

      return (
        <View className="flex-1 items-center justify-center bg-bg-primary px-xl">
          <Text className="font-sans-bold text-2xl text-text-primary">{i18next.t("error.oops")}</Text>
          <Text className="mt-md text-center font-sans text-base text-text-secondary">
            {this.state.error?.message ?? i18next.t("error.somethingWentWrong")}
          </Text>
          <Pressable
            onPress={this.handleReset}
            className="mt-xl rounded-md bg-primary px-xl py-md"
          >
            <Text className="font-sans-semibold text-base text-text-primary">
              {i18next.t("error.tryAgain")}
            </Text>
          </Pressable>
        </View>
      );
    }

    return this.props.children;
  }
}
